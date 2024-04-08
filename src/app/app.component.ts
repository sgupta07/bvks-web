import { Component, OnInit } from "@angular/core";

import { GlobalStateService } from "src/app/services/global-state.service";
import { AuthorizationService } from "./services/authorization.service";
import { FavoritesService } from "./services/favorites.service";
import { HistoryService } from "./services/history.service";
import { LecturesProgressService } from "./services/lectures-progress.service";
import { NotificationService } from "./services/notification.service";
import { PlaylistsFavoritesService } from "./services/playlists-favorites.service";
import { PlaylistsService } from "./services/playlists.service";
import { ActivatedRoute } from "@angular/router";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  constructor(
    private _globalStateService: GlobalStateService,
    private _lecturesProgressService: LecturesProgressService,
    private _authService: AuthorizationService,
    private _historyService: HistoryService,
    private _favoritesService: FavoritesService,
    private _playlistsService: PlaylistsService,
    private _notificationService: NotificationService,
    private _favoirtePlaylistsService: PlaylistsFavoritesService,
    private _route: ActivatedRoute
  ) {
    this._globalStateService.onPlaylistsLoaded.subscribe(() => {
      this._favoirtePlaylistsService.initUserFavoritePlaylists();
    });
  }
  async ngOnInit() {
    if (this._route.snapshot.url[0]?.path?.includes("admin")) {
      return;
    }

    await this._authService.init();
    this._favoritesService.initUserFavorites();
    this._notificationService.requestToken();
    // this._notificationService.listenNotification();
    this._lecturesProgressService.initProgressSubscribe();

    this._globalStateService.onLecturesLoaded.subscribe(() => {
      this._historyService.initUserHistory();
    });
    this._globalStateService.onHistoryChanged.subscribe(() => {
      this._historyService.initUserHistory();
    });

    await this._playlistsService.requestPlaylists();
    await this._favoirtePlaylistsService.initUserFavoritePlaylists();
  }
}
