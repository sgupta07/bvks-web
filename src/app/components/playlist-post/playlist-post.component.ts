import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { IPlaylist, IUser } from "./../../models/user";

import { AuthorizationService } from "src/app/services/authorization.service";
import { DownloadsService } from "src/app/services/downloads.service";
import { LecturesService } from "src/app/services/lectures.service";
import { PlaylistsFavoritesService } from "src/app/services/playlists-favorites.service";
import { PlaylistsService } from "src/app/services/playlists.service";
// import playlistThumbnail from "src/assets/img/playlist_thumbnail.png";

@Component({
  selector: "app-playlist-post",
  templateUrl: "./playlist-post.component.html",
  styleUrls: ["./playlist-post.component.scss"],
  host: {
    "(document:click)": "onDropdownClick($event)",
  },
})
export class PlaylistPostComponent implements OnInit {
  @Input() playlistData: IPlaylist;

  @ViewChild("button") button: ElementRef;

  showSkeleton = true;
  isDropdownActive = false;
  playlistTypeImage = "";
  isMyPlaylist: boolean;
  user: IUser;
  thumbnail = "";

  constructor(
    private _playlistsService: PlaylistsService,
    private _authService: AuthorizationService,
    private _playlistsFavoritesService: PlaylistsFavoritesService,
    private _downloadService: DownloadsService,
    private _favoritePlaylistsService: PlaylistsFavoritesService,
    private _lecturesService: LecturesService
  ) {}

  ngOnInit(): void {
    this.checkPlaylistImage();
    this.user = this._authService.getUser();
    this.isMyPlaylist = this.playlistData.authorEmail === this.user.email;
  }

  checkPlaylistImage() {
    this.thumbnail =
      this._lecturesService.getPlaylistsLectures(
        this.playlistData.lectureIds
      )[0]?.thumbnail || "../../../assets/img/playlist_thumbnail.jpg";
  }

  checkPlayListTypeImage(): string {
    return this.playlistData.listType === "Private"
      ? "../../../assets/icons/private.svg"
      : "../../../assets/icons/public.svg";
  }

  hideSkeleton() {
    this.showSkeleton = false;
  }

  onDropdownClick(event: any) {
    if (
      this.button.nativeElement &&
      !this.button.nativeElement.contains(event.target)
    ) {
      this.isDropdownActive = false;
    }
  }

  toggleDropdown() {
    this.isDropdownActive = !this.isDropdownActive;
  }

  toggleFavorites() {
    this._playlistsFavoritesService.toggleFavorites(this.playlistData.listID);
    this.toggleDropdown();
  }

  isPlaylistInFavorites(): boolean {
    if (this.playlistData) {
      return this._playlistsFavoritesService.isPlaylistInFavorites(
        this.playlistData.listID
      );
    }
  }

  async removePlaylist() {
    // FIRSTLY REMOVE FROM FAVORITES
    this._favoritePlaylistsService.removeFavorite(this.playlistData.listID);
    await this._favoritePlaylistsService.setFavoritePlaylitsInFirebase();
    this._playlistsService.removePlaylist(
      this.playlistData.listID,
      this.playlistData.listType
    );
  }
  downloadPlaylist() {
    this._downloadService.addLecturesToDownloads(this.playlistData.lectureIds);
  }
}
