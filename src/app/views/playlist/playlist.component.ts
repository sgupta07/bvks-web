import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { TuiDialogService } from "@taiga-ui/core";
import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";
import { FilterComponent } from "src/app/components/filter/filter.component";
import {
  FavoritesAction,
  ILecture,
  LecturePostMode,
  PlaybackMode,
} from "src/app/models/lecture";
import { IPlaylist } from "src/app/models/user";
import { AudioplayerService } from "src/app/services/audioplayer.service";
import { DownloadsService } from "src/app/services/downloads.service";
import { FavoritesService } from "src/app/services/favorites.service";
import { GlobalStateService } from "src/app/services/global-state.service";
import { LecturesProgressService } from "src/app/services/lectures-progress.service";
import { LecturesService } from "src/app/services/lectures.service";
import { MultiSelectService } from "src/app/services/multi-select.service";
import { NavigateBackService } from "src/app/services/navigate-back.service";
import { PlaylistsService } from "src/app/services/playlists.service";
import { FilterService } from "./../../services/filter.service";
import { EditPopupComponent } from "./edit-popup/edit-popup.component";

@Component({
  selector: "app-playlist",
  templateUrl: "./playlist.component.html",
  styleUrls: ["./playlist.component.scss"],
})
export class PlaylistComponent implements OnInit, OnDestroy {
  lecturesMode: LecturePostMode = LecturePostMode.play_audio;
  isSelectMode = false;
  selectedLecturesLength: number;
  activePlaylist: IPlaylist;
  playlistListID: string;
  playlistLectures: ILecture[] = [];
  editDialog: any;
  filterDialog: any;
  isMyPlaylist: boolean;
  form: FormGroup;

  get searchRequest() {
    return this._globalState.searchRequest;
  }

  get showRequest() {
    return this._globalState.showRequest;
  }

  get activeFiltersCount(): number {
    return this._filterService.getAllActiveFiltersCount();
  }

  get sortRequest() {
    return this._globalState.sortRequest;
  }

  set sortRequest(value: string) {
    this._globalState.sortRequest = value;
    this.setLectureMode();
  }
  set showRequest(value: PlaybackMode) {
    this._globalState.showRequest = value;
    this.setLectureMode();
  }

  constructor(
    public _lecturesService: LecturesService,
    private _multiSelectService: MultiSelectService,
    private _globalState: GlobalStateService,
    private _favoriteService: FavoritesService,
    private _downloadService: DownloadsService,
    private _lectureProgressService: LecturesProgressService,
    private _playlistsService: PlaylistsService,
    private _activatedRout: ActivatedRoute,
    private _audioPlayerService: AudioplayerService,
    private _router: Router,
    @Inject(NavigateBackService)
    private _navigateBackService: NavigateBackService,
    private readonly dialogService: TuiDialogService,
    private _filterService: FilterService
  ) {
    this._multiSelectService.onSelectedLecturesChange.subscribe(() => {
      this.selectedLecturesLength =
        this._multiSelectService.getSelectedLectures.length;
    });
    this._multiSelectService.onSelectMode.subscribe(() => {
      this.isSelectMode = this._multiSelectService.isSelectMode;
      this.setLectureMode();
    });
    this._globalState.onPlaylistsLoaded.subscribe(() => {
      this.init();
    });
    this._globalState.onRemoveLectureFromPlaylist.subscribe(() => {
      this.playlistLectures = this._lecturesService.getPlaylistsLectures(
        this.activePlaylist.lectureIds
      );
      this.activePlaylist = this._playlistsService.getCertainPlaylist(
        this.playlistListID
      );
    });
  }

  ngOnInit(): void {
    this.init();

    this._navigateBackService.oldPath = this._router.url;
  }

  ngOnDestroy() {
    this._filterService.clearActiveFilters();
    this._globalState.onFilterApply.emit();
    this._globalState.sortRequest = "Default View";
    this._globalState.showRequest = PlaybackMode.AUDIOS;
  }

  private init() {
    this.form = new FormGroup({
      show: new FormControl("All"),
      sort: new FormControl("Default View"),
      filter: new FormControl(null),
    });
    this.playlistListID = this._activatedRout.snapshot.params.listID;
    this.activePlaylist = this._playlistsService.getCertainPlaylist(
      this.playlistListID
    );
    if (!!this.activePlaylist?.lectureIds?.length) {
      this.playlistLectures = this._lecturesService.getPlaylistsLectures(
        this.activePlaylist.lectureIds
      );
    }
    this.selectedLecturesLength =
      this._multiSelectService.selectedLectures.length;
    this.editDialog = this.dialogService.open<number>(
      new PolymorpheusComponent(EditPopupComponent),
      {
        data: this.activePlaylist,
        dismissible: true,
        label: "Edit playlist",
        size: "m",
        closeable: false,
      }
    );
    this.filterDialog = this.dialogService.open<number>(
      new PolymorpheusComponent(FilterComponent),
      {
        data: 237,
        dismissible: true,
        label: "Filters",
        size: "s",
        closeable: false,
      }
    );
    this.isMyPlaylist = this._playlistsService.isMyPlaylist(
      this.activePlaylist?.authorEmail
    );
  }

  checkPlayListTypeImage(): string {
    return this.activePlaylist?.listType === "Private"
      ? "../../../assets/icons/private.svg"
      : "../../../assets/icons/public.svg";
  }

  private setLectureMode() {
    if (this.isSelectMode) {
      this.lecturesMode = LecturePostMode.select;
      return;
    }
    if (this._globalState.showRequest === PlaybackMode.AUDIOS) {
      this.lecturesMode = LecturePostMode.play_audio;
    } else {
      this.lecturesMode = LecturePostMode.open_lecture_page;
    }
  }
  addSelectedToFavorites() {
    this._favoriteService.toggleSelectedFavorites(FavoritesAction.ADD);
  }
  downloadLectures() {
    const selectedLectures = this._multiSelectService.getSelectedLecturesIds();
    this._downloadService.addLecturesToDownloads(selectedLectures);
  }

  markSelectedAsCompleted() {
    this._multiSelectService.selectedLectures.forEach(lecture => {
      this._lectureProgressService.markAsComplete(lecture);
    });
    this._multiSelectService.unchooseAll();
  }
  selectAll() {
    if (
      this.activeFiltersCount === 0 &&
      !this._globalState.searchRequest.length &&
      this.sortRequest === "Default View" &&
      this.showRequest !== PlaybackMode.VIDEOS
    ) {
      this._multiSelectService.setSelectAllLectures(
        this.playlistLectures.map(l => l.id)
      );
    }
    this._multiSelectService.chooseAll();
  }

  toggleSelectMode() {
    this._multiSelectService.toggleSelectMode();
  }

  isSortRequests(): boolean {
    return (
      !this.searchRequest.trim() &&
      this.sortRequest == "Default View" &&
      !this.activeFiltersCount &&
      this.showRequest == PlaybackMode.AUDIOS
    );
  }

  interractWithLecture(
    lecture: ILecture,
    arr: ILecture[],
    idx: number,
    playlistId: number
  ) {
    switch (this.lecturesMode) {
      case LecturePostMode.play_audio:
        this._audioPlayerService.setData(arr, idx);
        break;
      case LecturePostMode.open_lecture_page:
        this._router.navigate(["/lecture/", lecture.id], {
          queryParams: {
            videoListType: "playlist",
            videoListParams: playlistId,
          },
        });
      case LecturePostMode.select:
        this._multiSelectService.toggleLectureSelect(lecture.id);
      default:
        break;
    }
  }

  removeSelectedFromPlaylist() {
    this._multiSelectService.getSelectedLectures.forEach(l => {
      this._playlistsService.removeLectureFromPlaylist(l, this.playlistListID);
    });
    this._multiSelectService.unchooseAll();
  }
  async showEditPopup() {
    await this.editDialog.toPromise();
  }

  async showFilterDialog() {
    await this.filterDialog.toPromise();
  }
}
