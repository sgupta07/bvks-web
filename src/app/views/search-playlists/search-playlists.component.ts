import { IPlaylist } from "./../../models/user";
import { showPlaylistsType, sortPlaylistType } from "./../../models/playlists";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from "@angular/core";
import { PaginationService } from "src/app/services/pagination.service";
import { PlaylistsService } from "src/app/services/playlists.service";
import { GlobalStateService } from "src/app/services/global-state.service";
import { PlaylistsFavoritesService } from "src/app/services/playlists-favorites.service";
import { MultiSelectService } from "src/app/services/multi-select.service";

@Component({
  selector: "app-search-playlists",
  templateUrl: "./search-playlists.component.html",
  styleUrls: ["./search-playlists.component.scss"],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class SearchPlaylistsComponent implements OnInit {
  @Input() allPlaylists: IPlaylist[] = [];
  playlists: IPlaylist[] = [];

  get searchRequest() {
    return this._globalState.playlistsSearchRequest;
  }

  get showRequest() {
    return this._globalState.playlistsShowRequest;
  }

  get sortRequest() {
    return this._globalState.playlistsSortRequest;
  }

  set showRequest(value: showPlaylistsType) {
    this._globalState.playlistsShowRequest = value;
  }

  constructor(
    private _playlistService: PlaylistsService,
    private _globalState: GlobalStateService,
    private _favoritePlaylistService: PlaylistsFavoritesService
  ) {
    this._globalState.onPlaylistsFilterChange.subscribe(() => {
      this.initPlaylists();
    });
    this._globalState.onPlaylistDeleted.subscribe(() => {
      this.initPlaylists();
    });
    this._globalState.onRemovePlaylistFromFavoirte.subscribe(() => {
      this.initPlaylists();
    });
    this._globalState.onCreatePlaylist.subscribe(() => {
      this.initPlaylists();
    });
    this._globalState.onPlaylistSortChange.subscribe(() => {
      this.initPlaylists();
    });
  }

  ngOnInit(): void {
    this.initPlaylists();
  }

  initPlaylists() {
    this.playlists = this.getPlaylists();
  }

  getPlaylists() {
    const filteredPlaylists = this.filterPlaylists(
      this.allPlaylists,
      this.searchRequest,
      this.showRequest
    );
    return this.sortPlaylists(filteredPlaylists, this.sortRequest);
  }

  private filterPlaylists(
    playlists: IPlaylist[],
    searchRequest: string,
    showRequest: showPlaylistsType
  ) {
    let filteredByShowRequest = this.filterPlaylistsByShowRequest(
      playlists,
      showRequest
    );

    if (searchRequest == null || searchRequest.trim() === "") {
      return filteredByShowRequest;
    } else {
      const trimmedSearchRequest = searchRequest.toLowerCase().trim();
      const filteredBySortRequest = filteredByShowRequest?.filter(x => {
        if (x.title) {
          const isSubstringOfTitle = x.title
            .trim()
            .toLowerCase()
            .includes(trimmedSearchRequest);
          return isSubstringOfTitle;
        }
      });

      return filteredBySortRequest;
    }
  }

  private filterPlaylistsByShowRequest(
    playlists: IPlaylist[],
    showRequest: showPlaylistsType
  ): IPlaylist[] {
    const showReq = showRequest.trim();
    switch (showReq) {
      case showPlaylistsType.ALL:
        return playlists;
      case showPlaylistsType.PRIVATE:
        return this._playlistService.getPrivatePlaylists();
      case showPlaylistsType.ALLPUBLIC:
        return this._playlistService.getPublicPlaylists();
      case showPlaylistsType.MYPUBLIC:
        return this._playlistService.getMyPublicPlaylists();
      case showPlaylistsType.RECOMMENDED:
        return this._playlistService.getRecommendedPlaylists;
      case showPlaylistsType.FAVORITES:
        return this._favoritePlaylistService.getallFavoritePlaylists;

      default:
        return playlists;
    }
  }

  private sortPlaylists(playlists: IPlaylist[], sortType: string) {
    const sortFunction = this.getSortFunction(sortType);
    if (sortFunction == null) {
      return playlists;
    }

    return playlists.sort(sortFunction);
  }

  private getSortFunction(
    sortType: string
  ): (a: IPlaylist, b: IPlaylist) => number {
    switch (sortType) {
      case "":
      case undefined: {
        return null;
      }
      case sortPlaylistType.DEFAULT: {
        return (a, b) => (a.creationTime > b.creationTime ? 1 : -1);
      }
      case sortPlaylistType.ALPHABETICALLY: {
        return (a, b) =>
          a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1;
      }
      case sortPlaylistType.ALPHABETICALLYREVERSE: {
        return (a, b) =>
          b.title.toLowerCase() > a.title.toLowerCase() ? 1 : -1;
      }
    }

    return null;
  }
}
