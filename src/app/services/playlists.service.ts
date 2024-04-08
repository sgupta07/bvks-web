import { ILecture } from "src/app/models/lecture";
import { ICreatePlaylist, IPlaylist, IUser } from "./../models/user";
import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { take } from "rxjs/operators";
import { AuthorizationService } from "./authorization.service";
import { AngularFireAuth } from "@angular/fire/auth";
import { GlobalStateService } from "./global-state.service";
import { LecturesService } from "./lectures.service";
import { editPlaylist } from "../models/playlists";
import { PlaylistType } from "../models/enums/Playlists";
import { TuiNotification, TuiNotificationsService } from "@taiga-ui/core";

@Injectable({
  providedIn: "root",
})
export class PlaylistsService {
  publicPlaylists: IPlaylist[] = [];
  privatePlaylists: IPlaylist[] = [];
  allPlaylists: IPlaylist[] = [];
  user: IUser;
  playlistsToAdd: IPlaylist[] = [];
  admins: string[] = [];
  recommendedPlaylists: IPlaylist[] = [];

  get myPlaylists() {
    return this.allPlaylists.filter(p => p.authorEmail === this.user.email);
  }

  get getRecommendedPlaylists(): IPlaylist[] {
    return this.recommendedPlaylists;
  }
  get getAllPlaylists() {
    return this.allPlaylists;
  }

  get getPlaylistsToAdd() {
    return this.playlistsToAdd;
  }

  set setPlaylistToAdd(value: IPlaylist[]) {
    this.playlistsToAdd = value;
  }

  changePlaylistsToAdd(value: IPlaylist) {
    const deleteIdx = this.playlistsToAdd.findIndex(p => p === value);

    this.playlistsToAdd.includes(value)
      ? this.playlistsToAdd.splice(deleteIdx, 1)
      : this.playlistsToAdd.push(value);
  }

  getCertainPlaylist(listID: string): IPlaylist {
    return this.allPlaylists.find(p => p.listID === listID);
  }

  isMyPlaylist(email: string) {
    return this.user.email === email;
  }

  getPrivatePlaylists(): IPlaylist[] {
    return this.privatePlaylists;
  }
  getPublicPlaylists(): IPlaylist[] {
    return this.publicPlaylists;
  }
  getMyPublicPlaylists(): IPlaylist[] {
    return this.publicPlaylists.filter(p => p.authorEmail === this.user.email);
  }

  constructor(
    private _firestore: AngularFirestore,
    private _globalState: GlobalStateService,
    private _lectureService: LecturesService,
    private _firebaseAuth: AngularFireAuth,
    private notificationsService: TuiNotificationsService
  ) {}

  async requestPlaylists() {
    this.user = await this._firebaseAuth.user.pipe(take(1)).toPromise();
    this.publicPlaylists = await this._firestore
      .collection<IPlaylist>("PublicPlaylists")
      .valueChanges({ idField: "listID" })
      .pipe(take(1))
      .toPromise();

    this.privatePlaylists = await this._firestore
      .collection("PrivatePlaylists")
      .doc(this.user.uid)
      .collection<IPlaylist>(this.user.email)
      .valueChanges({ idField: "listID" })
      .pipe(take(1))
      .toPromise();

    this.allPlaylists = [...this.privatePlaylists, ...this.publicPlaylists];
    this.allPlaylists.forEach(p =>
      this.addListIdToFirebase(p.listID, p.listType)
    );
    await this.requestAdmins();
    this.setRecommendedPlaylists();
    this._globalState.onPlaylistsLoaded.emit(null);
  }

  setRecommendedPlaylists() {
    this.recommendedPlaylists = this.allPlaylists.filter(
      p =>
        this.admins.includes(p.authorEmail) &&
        p.listType === PlaylistType.PUBLIC
    );
  }

  isLectureInMyPlaylist(lectureId: number) {
    const myPlaylists = [
      ...this.getMyPublicPlaylists(),
      ...this.getPrivatePlaylists(),
    ];
    return myPlaylists.some(p => p.lectureIds.includes(lectureId));
  }

  async requestAdmins() {
    const res = await this._firestore
      .collection("admins")
      .valueChanges()
      .pipe(take(1))
      .toPromise();
    this.admins = res.map((x: IUser) => x.email);
  }

  async createPlaylist(playlistData: ICreatePlaylist, lectureIds: number[]) {
    let newPlaylist: IPlaylist = {
      authorEmail: this.user.email,
      creationTime: Date.now(),
      discription: playlistData.discription,
      docPath:
        playlistData.listType === "Public"
          ? `PublicPlaylists/${this.user.uid}`
          : `PrivatePlaylists/${this.user.uid}`,
      lastUpdate: Date.now(),
      lecturesCategory: playlistData.lecturesCategory,
      lectureIds: lectureIds,
      listType: playlistData.listType,
      thumbnail: "",
      title: playlistData.title,
      lectureCount: lectureIds.length,
    };
    if (playlistData.listType === "Public") {
      await this._firestore.collection("PublicPlaylists").add(newPlaylist);
    } else {
      await this._firestore
        .collection("PrivatePlaylists")
        .doc(this.user.uid)
        .collection(this.user.email)
        .add(newPlaylist);
    }
    await this.requestPlaylists();
    this._globalState.onCreatePlaylist.emit(null);
  }

  addLectureToPlaylist(lectureIds: number[]) {
    this.playlistsToAdd.forEach(async p => {
      const currentPlaylist = this.allPlaylists.find(
        playlist => playlist.listID === p.listID
      );
      lectureIds.forEach(l => {
        if (!currentPlaylist.lectureIds.includes(l)) {
          currentPlaylist.lectureIds.push(l);
        } else {
          this.notificationsService
            .show("", {
              label: "This lecture is already in playlist",
              status: TuiNotification.Error,
            })
            .subscribe();
        }
      });
      if (currentPlaylist.listType === PlaylistType.PUBLIC) {
        await this._firestore
          .collection<IPlaylist>("PublicPlaylists")
          .doc(currentPlaylist.listID)
          .update({
            lectureIds: currentPlaylist.lectureIds,
            lectureCount: currentPlaylist.lectureIds.length,
          });
      } else {
        await this._firestore
          .collection<IPlaylist>("PrivatePlaylists")
          .doc(this.user.uid)
          .collection(this.user.email)
          .doc(currentPlaylist.listID)
          .update({
            lectureIds: currentPlaylist.lectureIds,
            lectureCount: currentPlaylist.lectureIds.length,
          });
      }
    });
  }

  async removePlaylist(id: string, listType: string) {
    const deleteIdx = this.allPlaylists.findIndex(p => p.listID === id);
    this.allPlaylists.splice(deleteIdx, 1);
    if (listType === PlaylistType.PUBLIC) {
      this.publicPlaylists = this.publicPlaylists.filter(p => p.listID !== id);
      await this._firestore
        .collection<IPlaylist>("PublicPlaylists")
        .doc(id)
        .delete();
    } else {
      this.privatePlaylists = this.privatePlaylists.filter(
        p => p.listID !== id
      );
      await this._firestore
        .collection<IPlaylist>(`PrivatePlaylists`)
        .doc(this.user.uid)
        .collection(this.user.email)
        .doc(id)
        .delete();
    }
    this._globalState.onPlaylistDeleted.emit(null);
  }

  async editPlaylist(playlistInfo: editPlaylist) {
    const editedPlaylist = this.allPlaylists.find(
      p => p.listID === playlistInfo.listID
    );
    editedPlaylist.title = playlistInfo.title;
    editedPlaylist.lecturesCategory = playlistInfo.lecturesCategory;
    editedPlaylist.discription = playlistInfo.discription;

    if (playlistInfo.listType !== editedPlaylist.listType) {
      editedPlaylist.listType = playlistInfo.listType;
      await this.copyPlaylist(editedPlaylist);
      if (editedPlaylist.listType === PlaylistType.PUBLIC) {
        await this.removePlaylist(editedPlaylist.listID, PlaylistType.PRIVATE);
      } else {
        await this.removePlaylist(editedPlaylist.listID, PlaylistType.PUBLIC);
      }
    } else {
      if (playlistInfo.listType === PlaylistType.PUBLIC) {
        await this._firestore
          .collection<IPlaylist>(`PublicPlaylists`)
          .doc(playlistInfo.listID)
          .update({
            title: playlistInfo.title,
            discription: playlistInfo.discription,
            lecturesCategory: playlistInfo.lecturesCategory,
            listType: playlistInfo.listType,
          });
      } else {
        await this._firestore
          .collection<IPlaylist>(`PrivatePlaylists`)
          .doc(this.user.uid)
          .collection(this.user.email)
          .doc(playlistInfo.listID)
          .update({
            title: playlistInfo.title,
            discription: playlistInfo.discription,
            lecturesCategory: playlistInfo.lecturesCategory,
            listType: playlistInfo.listType,
          });
      }
    }
    await this.requestPlaylists();
  }

  async removeLectureFromPlaylist(lectureId: number, playlistId: string) {
    const currentPlaylist = this.allPlaylists.find(
      p => p.listID === playlistId
    );
    const deleteIdx = currentPlaylist.lectureIds.findIndex(
      l => l === lectureId
    );
    currentPlaylist.lectureIds.splice(deleteIdx, 1);
    this._globalState.onRemoveLectureFromPlaylist.emit(null);

    if (currentPlaylist.listType === PlaylistType.PUBLIC) {
      await this._firestore
        .collection<IPlaylist>(`PublicPlaylists`)
        .doc(currentPlaylist.listID)
        .update({
          lectureIds: currentPlaylist.lectureIds,
          lectureCount: currentPlaylist.lectureIds.length,
        });
    } else {
      await this._firestore
        .collection<IPlaylist>(`PrivatePlaylists`)
        .doc(this.user.uid)
        .collection(this.user.email)
        .doc(currentPlaylist.listID)
        .update({
          lectureIds: currentPlaylist.lectureIds,
          lectureCount: currentPlaylist.lectureIds.length,
        });
    }
  }

  private async copyPlaylist(newPlaylistData: IPlaylist) {
    let newPlaylist: IPlaylist = {
      authorEmail: this.user.email,
      creationTime: newPlaylistData.creationTime,
      discription: newPlaylistData.discription,
      docPath:
        newPlaylistData.listType === "Public"
          ? `PublicPlaylists/${this.user.uid}`
          : `PrivatePlaylists/${this.user.uid}/${this.user.email}/${newPlaylistData.listID}`,
      lastUpdate: newPlaylistData.lastUpdate,
      lecturesCategory: newPlaylistData.lecturesCategory,
      lectureIds: newPlaylistData.lectureIds,
      listType: newPlaylistData.listType,
      thumbnail: newPlaylistData.thumbnail,
      title: newPlaylistData.title,
      listID: newPlaylistData.listID,
      lectureCount: newPlaylistData.lectureCount,
    };
    if (newPlaylistData.listType === "Public") {
      await this._firestore
        .collection("PublicPlaylists")
        .doc(newPlaylistData.listID)
        .set(newPlaylist);
    } else {
      await this._firestore
        .collection("PrivatePlaylists")
        .doc(this.user.uid)
        .collection(this.user.email)
        .doc(newPlaylistData.listID)
        .set(newPlaylist);
    }
  }

  private async addListIdToFirebase(listId: string, type: PlaylistType) {
    if (type === PlaylistType.PUBLIC) {
      await this._firestore
        .collection<IPlaylist>(`PublicPlaylists`)
        .doc(listId)
        .update({
          listID: listId,
        });
    } else {
      await this._firestore
        .collection<IPlaylist>(`PrivatePlaylists`)
        .doc(this.user.uid)
        .collection(this.user.email)
        .doc(listId)
        .update({
          listID: listId,
        });
    }
  }

  getPlaylistLecturesById(id: string) {
    const playlistData = this.getCertainPlaylist(id);

    if (!playlistData) {
      return;
    }

    return this._lectureService.getPlaylistsLectures(playlistData.lectureIds);
  }
}
