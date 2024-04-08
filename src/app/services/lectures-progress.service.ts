import { ILecture } from "./../models/lecture";
import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Subscriber, Subscription } from "rxjs";
import { IUserLecture } from "../models/user";
import { AuthorizationService } from "./authorization.service";
import { GlobalStateService } from "src/app/services/global-state.service";

@Injectable({
  providedIn: "root",
})
export class LecturesProgressService {
  user: any;
  lecturesProgress: IUserLecture[];
  lecturesProgressObserver: Subscription;

  constructor(
    private _firestore: AngularFirestore,
    private _globalStateService: GlobalStateService,
    private _authService: AuthorizationService
  ) {
    this._authService.onSignIn.subscribe(() => this.initProgressSubscribe());
  }

  initProgressSubscribe() {
    this.user = this._authService.getUser();

    if (!this.user) {
      return;
    }

    if (this.lecturesProgressObserver) {
      this.lecturesProgressObserver.unsubscribe();
    }

    this.lecturesProgressObserver = this._firestore
      .collection(`/users/${this.user.uid}/lectureInfo/`)
      .valueChanges()
      .subscribe((val: IUserLecture[]) => (this.lecturesProgress = val));
  }

  getProgressInPercents(id: number): number {
    const lectureData = this.getProgressByLectureId(id);

    if (!lectureData) {
      return 0;
    }

    if (lectureData.isCompleted) {
      return 100;
    }

    if (!lectureData.lastPlayedPoint || !lectureData.totallength) {
      return 0;
    }

    if (lectureData.totallength - lectureData.lastPlayedPoint < 2) {
      return 100;
    }

    const percent = lectureData.totallength / 100;

    return lectureData.lastPlayedPoint / percent;
  }

  getProgressByLectureId(id: number): IUserLecture {
    if (!this.user || !this.lecturesProgress) {
      return;
    }

    const lectureLog = this.lecturesProgress.find(x => x.id === id);

    if (!lectureLog) {
      // if object doesnt exist, generate new
      const uniqLogId = this._firestore.createId();

      return {
        android: null,
        creationTimestamp: Date.now(),
        documentId: uniqLogId,
        documentPath: `/users/${this.user.uid}/lectureInfo/${uniqLogId}`,
        downloadPlace: 0,
        favouritePlace: 0,
        id,
        ios: null,
        isCompleted: false,
        isDownloaded: false,
        isFavourite: false,
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
    }

    //return last log
    return lectureLog;
  }

  async updateLectureProgress(lectureData: IUserLecture) {
    const lastModifiedTimestamp = Date.now();

    try {
      // try to update lecture progress
      await this._firestore.doc(lectureData.documentPath).update({
        lastPlayedPoint: lectureData.lastPlayedPoint,
        lastModifiedTimestamp,
      });
    } catch (error) {
      // try to create new log if log doesnt exist
      try {
        await this._firestore.doc(lectureData.documentPath).set({
          ...lectureData,
          lastModifiedTimestamp,
        });
      } catch (error) {
        throw error;
      }
    }

    this._globalStateService.onHistoryChanged.emit();
  }

  async markAsComplete(id: number) {
    const res = this.getProgressByLectureId(id);

    try {
      await this._firestore.doc(res.documentPath).update({
        isCompleted: true,
      });
    } catch (error) {
      await this._firestore.doc(res.documentPath).set({
        ...res,
        lastModifiedTimestamp: Date.now(),
      });
    }
  }

  async resetCompletion(id: number) {
    const res = this.getProgressByLectureId(id);
    await this._firestore.doc(res.documentPath).update({
      isCompleted: false,
      lastPlayedPoint: 0,
    });
  }
}
