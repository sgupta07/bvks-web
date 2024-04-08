import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { ILectureInfo } from "./../models/lecture-info";
import { LecturesService } from "./lectures.service";

import { take } from "rxjs/operators";

import { AuthorizationService } from "src/app/services/authorization.service";
import { GlobalStateService } from "src/app/services/global-state.service";

import { FavoritesAction, ILecture } from "./../models/lecture";
import { MultiSelectService } from "./multi-select.service";

import { IUser } from "../models/user";

@Injectable({
  providedIn: "root",
})
export class FavoritesService {
  public favorites: ILecture[] = [];
  public favoriteLecturesIsLoaded = false;

  private favoritesId: number[] = [];
  private favoritesData: ILectureInfo[] = [];
  private userId: string;
  private lecturesData: any;

  private user: IUser;

  get allFavoriteLectures(): ILecture[] {
    return this.favorites;
  }

  constructor(
    private _firestore: AngularFirestore,
    private _authService: AuthorizationService,
    private _lecturesService: LecturesService,
    private _globalStateService: GlobalStateService,
    private _multiselectService: MultiSelectService
  ) {}

  async initUserFavorites() {
    this.user = this._authService.getUser();

    if (!this.user) {
      return;
    }

    const favoritesId: number[] = await this.getFavoritesIdFromFirebase();

    this.lecturesData = [
      ...(await this._firestore
        .collection("users")
        .doc(this.user.uid)
        .collection<ILectureInfo>("lectureInfo")
        .valueChanges()
        .pipe(take(1))
        .toPromise()),
    ];

    if (favoritesId?.length) this.favoritesId = favoritesId;

    this.favorites = await this.getFavoriteLectures();
    this.favoriteLecturesIsLoaded = true;
  }

  async toggleFavorites(lectureId: number) {
    if (!this.isLectureInFavorites(lectureId)) {
      this.addToFavorites(lectureId);

      return;
    }

    this.removeFavorite(lectureId);
  }

  addSelectedLecturesToFavorites() {
    this._multiselectService.getSelectedLectures.forEach(item => {
      this.addSelectedToFavorite(item);
    });
  }

  isLectureInFavorites(favoriteId: number): boolean {
    return this.favoritesId.includes(favoriteId);
  }

  private async addSelectedToFavorite(id: number) {
    if (!this.isLectureInFavorites(id)) {
      const favoriteObj: ILectureInfo = this.generateFavoriteLecture(id);

      const lecture = this.getLectureById(id);

      this.favoritesId.push(id);
      this.favorites.push(lecture);

      this._firestore
        .collection("users")
        .doc(this.user.uid)
        .collection("lectureInfo")
        .doc(favoriteObj.documentId)
        .set(favoriteObj);

      this._globalStateService.onFavoritesChanged.emit();
    }
  }

  private async getFavoriteLectures() {
    const favorites: ILecture[] = [];

    this.favoritesId.forEach((id: number) => {
      const lecture = this._lecturesService.allLectures.find(
        (lecture: ILecture) => {
          return lecture.id === id;
        }
      );

      if (lecture) favorites.push(lecture);
    });

    return favorites;
  }

  private async refreshLecturesData() {
    this.favoritesData = [
      ...(await this._firestore
        .collection("users")
        .doc(this.user.uid)
        .collection<ILectureInfo>("lectureInfo", ref => {
          return ref.where("isFavourite", "==", true);
        })
        .valueChanges()
        .pipe(take(1))
        .toPromise()),
    ];

    this.lecturesData = [
      ...(await this._firestore
        .collection("users")
        .doc(this.user.uid)
        .collection<ILectureInfo>("lectureInfo")
        .valueChanges()
        .pipe(take(1))
        .toPromise()),
    ];
  }

  private generateFavoriteLecture(id: number): ILectureInfo {
    const documentId = this._firestore.createId();

    let lectureInfo = this.lecturesData.find((lectureInfo: ILectureInfo) => {
      return lectureInfo.id === id;
    });

    if (!lectureInfo) {
      lectureInfo = {
        android: null,
        creationTimestamp: Date.now(),
        documentId: lectureInfo?.documentId
          ? lectureInfo?.documentId
          : documentId,
        documentPath: `users/${this.user.uid}/lectureInfo/${documentId}`,
        downloadPlace: 0,
        favouritePlace: 0,
        id,
        ios: null,
        isCompleted: false,
        isDownloaded: false,
        isFavourite: true,
        isInPrivateList: false,
        isInPublicList: false,
        lastModifiedTimestamp: Date.now(),
        lastPlayedPoint: 0,
        privateListIDs: null,
        publicListIDs: null,
        totalPlayedNo: 0,
        totalPlayedTime: 0,
        totallength: 0,
      };
    } else {
      lectureInfo.documentId = lectureInfo?.documentId
        ? lectureInfo?.documentId
        : documentId;
      lectureInfo.isFavourite = true;
    }

    return lectureInfo;
  }

  async toggleSelectedFavorites(action: FavoritesAction) {
    this._multiselectService.getSelectedLectures.forEach(async selected => {
      action === FavoritesAction.ADD
        ? await this.addSelectedToFavorite(selected)
        : await this.removeFavorite(selected);

      this._multiselectService.unchooseAll();
    });

    this.refreshLecturesData();
  }

  private getLectureById(id: number) {
    return this._lecturesService.allLectures.find(
      (lecture: ILecture) => lecture.id === id
    );
  }

  private async addToFavorites(lectureId: number) {
    await this.refreshLecturesData();

    const favoriteObj: ILectureInfo = this.generateFavoriteLecture(lectureId);

    const lecture = this.getLectureById(lectureId);

    this.favoritesId.push(lectureId);
    this.favorites.push(lecture);

    this._firestore
      .collection("users")
      .doc(this.user.uid)
      .collection("lectureInfo")
      .doc(favoriteObj.documentId)
      .set(favoriteObj);
  }

  private async removeFavorite(favoriteId: number) {
    await this.refreshLecturesData();

    const favoriteIdToDelete = this.favorites.findIndex(favorite => {
      return favorite.id === favoriteId;
    });

    let favoriteToDelete = this.favoritesData.find((favorite: ILectureInfo) => {
      return favorite.id === favoriteId;
    });

    favoriteToDelete.isFavourite = false;

    this._firestore
      .collection("users")
      .doc(this.user.uid)
      .collection("lectureInfo")
      .doc(favoriteToDelete?.documentId)
      .set(favoriteToDelete)
      .then(async () => {
        this.favoritesId = await this.getFavoritesIdFromFirebase();
      });

    this.favorites.splice(favoriteIdToDelete, 1);

    this._globalStateService.onFavoritesChanged.emit();
  }

  private async getFavoritesIdFromFirebase(): Promise<number[]> {
    const favoriteIds = new Set<number>();

    this.favoritesData = [
      ...(await this._firestore
        .collection("users")
        .doc(this.user.uid)
        .collection<ILectureInfo>("lectureInfo", ref => {
          return ref.where("isFavourite", "==", true);
        })
        .valueChanges()
        .pipe(take(1))
        .toPromise()),
    ];

    this.favoritesData.forEach((l: any) => favoriteIds.add(l.id));

    return [...favoriteIds];
  }
}
