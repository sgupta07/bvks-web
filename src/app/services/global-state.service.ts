import { PlaybackMode } from "./../models/lecture";
import {
  searchTypes,
  showPlaylistsType,
  sortPlaylistType,
} from "./../models/playlists";
import { ILecture } from "src/app/models/lecture";
import { Injectable, EventEmitter } from "@angular/core";

import { LecturesService } from "./../services/lectures.service";

@Injectable({
  providedIn: "root",
})
export class GlobalStateService {
  onFilterChanged = new EventEmitter()!;
  onSortChanged = new EventEmitter()!;
  onFavoritesChanged = new EventEmitter()!;
  onFavoritesLoaded = new EventEmitter()!;
  onProgressChanged = new EventEmitter<null | number>()!;
  onHistorySortChanged = new EventEmitter()!;
  onFilterApply = new EventEmitter()!;
  onCategoryLecturesLoaded = new EventEmitter()!;
  onLecturesLoaded = new EventEmitter()!;
  onHistoryChanged = new EventEmitter();
  onPageIndexChanged = new EventEmitter<number>()!;
  onPeriodChange = new EventEmitter()!;
  onPlaylistsFilterChange = new EventEmitter()!;
  onUserAgentCheck = new EventEmitter<string>()!;
  onPlaylistsLoaded = new EventEmitter()!;
  onPlaylistDeleted = new EventEmitter();
  onRemovePlaylistFromFavoirte = new EventEmitter();
  onCreatePlaylist = new EventEmitter();
  onRemoveLectureFromPlaylist = new EventEmitter();
  onPlaylistSortChange = new EventEmitter();

  private _searchRequest = "";
  private _sortRequest = "";
  private _showRequest: PlaybackMode = PlaybackMode.AUDIOS;
  private _historyRequest = "";
  private _periodRequest = "";
  private _playlistsSearchRequest = "";
  private _playlistsShowRequest = showPlaylistsType.ALL;
  private _playlistsSortRequest = sortPlaylistType.DEFAULT;
  private _allTime = false;
  private _searchType: searchTypes = searchTypes.DEFAULT;

  public isUserWantToStay: boolean = false;

  get searchRequest(): string {
    return this._searchRequest;
  }

  get playlistsSearchRequest(): string {
    return this._playlistsSearchRequest;
  }

  set playlistsSearchRequest(value: string) {
    this._playlistsSearchRequest = value;
    this.onPlaylistsFilterChange.emit();
  }

  set searchRequest(value: string) {
    this._searchRequest = value;
    this.onFilterChanged.emit();
  }

  get showRequest(): PlaybackMode {
    return this._showRequest;
  }

  set showRequest(value: PlaybackMode) {
    this._showRequest = value;
    this.onFilterChanged.emit();
  }

  get playlistsShowRequest(): showPlaylistsType {
    return this._playlistsShowRequest;
  }

  set playlistsShowRequest(value: showPlaylistsType) {
    this._playlistsShowRequest = value;
    this.onPlaylistsFilterChange.emit(null);
  }

  get playlistsSortRequest(): sortPlaylistType {
    return this._playlistsSortRequest;
  }

  set playlistsSortRequest(value: sortPlaylistType) {
    this._playlistsSortRequest = value;
    this.onPlaylistSortChange.emit(null);
  }

  get historyRequest(): string {
    return this._historyRequest;
  }

  set historyRequest(value: string) {
    this._historyRequest = value;
    this.onFilterChanged.emit();
  }

  get sortRequest(): string {
    return this._sortRequest;
  }

  set sortRequest(value: string) {
    this._sortRequest = value;
    this.onSortChanged.emit();
  }

  set filterRequest(value: string) {
    this.onFilterChanged.emit();
  }
  get periodRequest(): string {
    return this._periodRequest;
  }

  set periodRequest(value: string) {
    this._periodRequest = value;
    this.onPeriodChange.emit();
  }

  setSortRequest(sortType: string) {
    this.sortRequest = sortType;
  }

  get searchType(): searchTypes {
    return this._searchType;
  }

  set searchType(value: searchTypes) {
    this._searchType = value;
  }

  constructor() {
    this.showRequest = PlaybackMode.AUDIOS;
    this.sortRequest = "Default View";
    this.historyRequest = "All history";
  }
}
