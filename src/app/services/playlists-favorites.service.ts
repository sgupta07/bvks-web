import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { take } from "rxjs/operators";
import { IUser } from "../models/user";
import { IPlaylist } from "./../models/user";
import { AuthorizationService } from "./authorization.service";
import { GlobalStateService } from "./global-state.service";
import { PlaylistsService } from "./playlists.service";

@Injectable({
  providedIn: "root",
})
export class PlaylistsFavoritesService {
  public favoritePlaylists: IPlaylist[] = [];
  private favoritePlaylistsIds: string[] = [];

  private user: IUser;

  get getallFavoritePlaylists(): IPlaylist[] {
    return this.favoritePlaylists;
  }

  constructor(
    private _firestore: AngularFirestore,
    private _authService: AuthorizationService,
    private _firebaseAuth: AngularFireAuth,
    private _playlistsService: PlaylistsService,
    private _globalState: GlobalStateService
  ) {}

  async initUserFavoritePlaylists() {
    this.user = await this._firebaseAuth.user.pipe(take(1)).toPromise();
    const userData: any = await this._firestore
      .collection("users")
      .doc(this.user.uid)
      .valueChanges()
      .pipe(take(1))
      .toPromise();
    if (userData?.favoritePlaylistsIds) {
      this.favoritePlaylistsIds = userData.favoritePlaylistsIds;
    }
    this.favoritePlaylists = this.getFavoritePlaylists();
  }

  getFavoritePlaylists() {
    return this.favoritePlaylistsIds.map(x =>
      this._playlistsService.getAllPlaylists.find(p => p.listID == x)
    );
  }

  async toggleFavorites(playlistId: string) {
    this.addFavorite(playlistId);
    await this.setFavoritePlaylitsInFirebase();
    this.favoritePlaylists = this.getFavoritePlaylists();
  }

  addFavorite(favoriteId: string) {
    if (!this.isPlaylistInFavorites(favoriteId)) {
      this.favoritePlaylistsIds.push(favoriteId);
    } else {
      this.removeFavorite(favoriteId);
    }
  }

  async setFavoritePlaylitsInFirebase() {
    await this._firestore.collection("users").doc(this.user.uid).set({
      favoritePlaylistsIds: this.favoritePlaylistsIds,
    });
  }

  isPlaylistInFavorites(favoriteId: string): boolean {
    return this.favoritePlaylistsIds.includes(favoriteId);
  }
  removeFavorite(favoriteId: string) {
    const favoriteIdToDelete = this.favoritePlaylistsIds.findIndex(
      id => id === favoriteId
    );

    this.favoritePlaylistsIds.splice(favoriteIdToDelete, 1);
    this.favoritePlaylists.splice(favoriteIdToDelete, 1);
    this._globalState.onRemovePlaylistFromFavoirte.emit(null);
  }
}
