import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { TuiDialogService } from "@taiga-ui/core";
import { DashboardService } from "src/app/services/dashboard.service";
import { GlobalStateService } from "src/app/services/global-state.service";
import { NavigateBackService } from "src/app/services/navigate-back.service";
import { PlaylistsFavoritesService } from "src/app/services/playlists-favorites.service";
import { PlaylistsService } from "src/app/services/playlists.service";
import { showPlaylistsType, sortPlaylistType } from "./../../models/playlists";
import { IPlaylist } from "./../../models/user";
import { ModalService } from "./../../services/modal.service";

@Component({
  selector: "app-playlists",
  templateUrl: "./playlists.component.html",
  styleUrls: ["./playlists.component.scss"],
})
export class PlaylistsComponent implements OnInit, OnDestroy {
  form: FormGroup;
  playlists: IPlaylist[] = [];
  searchPlaylists: IPlaylist[] = [];

  get searchRequest() {
    return this._globalState.playlistsSearchRequest;
  }

  get showRequest() {
    return this._globalState.playlistsShowRequest;
  }
  set showRequest(value: showPlaylistsType) {
    this._globalState.playlistsShowRequest = value;
  }

  get sortRequest(): sortPlaylistType {
    return this._globalState.playlistsSortRequest;
  }

  set sortRequest(value: sortPlaylistType) {
    this._globalState.playlistsSortRequest = value;
  }

  constructor(
    private readonly dialogService: TuiDialogService,
    private _playlistsService: PlaylistsService,
    private _globalState: GlobalStateService,
    private _favoirtePlaylistsService: PlaylistsFavoritesService,
    private _modalService: ModalService,
    private _router: Router,
    private _dashboardService: DashboardService,
    @Inject(NavigateBackService)
    private _navigateBackService: NavigateBackService
  ) {
    this._globalState.onPlaylistsLoaded.subscribe(() => {
      this.playlists = this._playlistsService.getAllPlaylists;
      this.searchPlaylists = [...this.playlists];
    });
  }

  ngOnInit() {
    this._dashboardService.onSearchFieldPlaceholderChange.emit(
      "Search playlists here"
    );

    this.form = new FormGroup({
      show: new FormControl("All"),
      sort: new FormControl("Default View"),
    });
    this.playlists = this._playlistsService.getAllPlaylists;
    this.searchPlaylists = [...this.playlists];
    this._navigateBackService.oldPath = this._router.url;
  }

  ngOnDestroy() {
    this._dashboardService.onSearchFieldPlaceholderChange.emit(
      "Search here (E.g. surrender, love, Bg 4.34, SB 8.19.19, etc"
    );

    this._globalState.playlistsSearchRequest = "";
  }

  showCreateDialog() {
    this._modalService.showCreatePlaylistDialog();
  }

  isSortRequests(): boolean {
    return (
      !this.searchRequest.trim() &&
      this.showRequest === showPlaylistsType.ALL &&
      this.sortRequest == sortPlaylistType.DEFAULT
    );
  }
}
