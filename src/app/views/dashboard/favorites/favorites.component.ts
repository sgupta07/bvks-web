import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { FilterComponent } from "./../../../components/filter/filter.component";
import { MultiSelectService } from "./../../../services/multi-select.service";
import { Paginator } from "./../base-lectures-container";

import { FavoritesService } from "./../../../services/favorites.service";
import { FilterService } from "./../../../services/filter.service";
import { GlobalStateService } from "./../../../services/global-state.service";
import { PaginationService } from "./../../../services/pagination.service";
import { SortService } from "./../../../services/sort.service";

import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";

import { TuiDialogService } from "@taiga-ui/core";
import { AudioplayerService } from "src/app/services/audioplayer.service";
import { DownloadsService } from "src/app/services/downloads.service";
import { LecturesProgressService } from "src/app/services/lectures-progress.service";
import { ModalService } from "src/app/services/modal.service";
import { NavigateBackService } from "src/app/services/navigate-back.service";
import { environment } from "src/environments/environment";
import {
  FavoritesAction,
  ILecture,
  LecturePostMode,
  PlaybackMode,
} from "./../../../models/lecture";
@Component({
  selector: "app-favorites",
  templateUrl: "./favorites.component.html",
  styleUrls: ["./favorites.component.scss"],
})
export class FavoritesComponent implements OnInit {
  activeLecture: any;
  activePlayList: any;
  isLecturePopupActive = false;
  form: FormGroup;
  isSelectMode = false;
  selectedLecturesLength: number;
  oldLectures: any;
  data: ILecture[];
  dataToRender: ILecture[] = [];
  paginator: any;
  isSelectAfterSearch = false;
  lecturesMode: LecturePostMode = LecturePostMode.play_audio;

  get favoriteLecturesIsLoaded(): boolean {
    return this._favoritesService.favoriteLecturesIsLoaded;
  }

  get activeFiltersCount(): number {
    return this._filterService.getAllActiveFiltersCount();
  }

  get limit(): number {
    return this._paginationService.pageIndex;
  }

  get lectures() {
    return this._favoritesService.allFavoriteLectures;
  }

  get paginationIndex() {
    return this._paginationService.pageIndex;
  }

  get searchRequest() {
    return this._lectureMethodsService.searchRequest;
  }

  set searchRequest(value: string) {
    this._lectureMethodsService.searchRequest = value;
  }

  get sortRequest() {
    return this._lectureMethodsService.sortRequest;
  }

  get showRequest() {
    this.setLectureMode();

    return this._lectureMethodsService.showRequest;
  }

  set showRequest(value: PlaybackMode) {
    this._lectureMethodsService.showRequest = value;
  }
  set sortRequest(value: string) {
    this._lectureMethodsService.sortRequest = value;
  }

  constructor(
    public _sortService: SortService,
    private _paginationService: PaginationService,
    private _filterService: FilterService,
    private _lectureMethodsService: GlobalStateService,
    private _dialogService: TuiDialogService,
    private _multiSelectService: MultiSelectService,
    private route: ActivatedRoute,
    private _favoritesService: FavoritesService,
    private _downloadService: DownloadsService,
    private _lectureProgressService: LecturesProgressService,
    private _router: Router,
    private _audioPlayerService: AudioplayerService,
    private _modalService: ModalService,
    @Inject(NavigateBackService)
    private _navigateBackService: NavigateBackService,
    private _globalStateService: GlobalStateService
  ) {
    this._multiSelectService.onSelectedLecturesChange.subscribe(() => {
      this.selectedLecturesLength =
        this._multiSelectService.selectedLectures.length;
    });
    this._multiSelectService.onSelectMode.subscribe(() => {
      this.isSelectMode = this._multiSelectService.isSelectMode;
      this.setLectureMode();
    });

    this.route.url.subscribe(() => {
      this._multiSelectService.unchooseAll();
      this._multiSelectService.setSelectAllLectures([]);
    });
  }

  ngOnInit() {
    this._navigateBackService.oldPath = this._router.url;

    this.isSelectMode = this._multiSelectService.isSelectMode;

    this.form = new FormGroup({
      show: new FormControl(null),
      sort: new FormControl(null),
      filter: new FormControl(null),
    });

    this._paginationService.pageIndex = 1;

    this.data = this._favoritesService.favorites;

    this.paginator = new Paginator();
    this.paginator.setData(this.data);
    this.selectedLecturesLength =
      this._multiSelectService.selectedLectures.length;
  }

  private readonly dialog = this._dialogService.open<number>(
    new PolymorpheusComponent(FilterComponent),
    {
      data: 237,
      dismissible: true,
      label: "Filters",
      size: "s",
      closeable: false,
    }
  );

  downloadLectures() {
    const selectedLectures = this._multiSelectService.getSelectedLecturesIds();
    this._downloadService.addLecturesToDownloads(selectedLectures);

    this._multiSelectService.unchooseAll();
  }

  checkLectureImage(image: string): string {
    return image ? image : environment.lectionThumbnailPlaceholder;
  }

  playLecture(lecture: any, playListData: any) {
    this.activeLecture = playListData.findIndex(
      (l: any) => l.id === lecture.id
    );
    this.activePlayList = playListData;
    this.isLecturePopupActive = true;
  }

  closeLecturePopup() {
    this.isLecturePopupActive = false;
  }

  isSortRequests(): boolean {
    return (
      !this.searchRequest.trim() &&
      this.sortRequest == "Default View" &&
      !this.activeFiltersCount &&
      this.showRequest == PlaybackMode.AUDIOS
    );
  }

  async showDialog() {
    await this.dialog.toPromise();
  }

  markSelectedAsCompleted() {
    this._multiSelectService.selectedLectures.forEach(lecture => {
      this._lectureProgressService.markAsComplete(lecture);
    });
    this._multiSelectService.unchooseAll();
  }

  toggleSelectMode() {
    this._multiSelectService.toggleSelectMode();
  }

  selectAll() {
    if (
      this.activeFiltersCount === 0 &&
      !this._globalStateService.searchRequest &&
      this.sortRequest === "Default View" &&
      this.showRequest !== PlaybackMode.VIDEOS
    ) {
      this._multiSelectService.setSelectAllLectures(
        this._favoritesService.allFavoriteLectures.map(l => l.id)
      );
    }
    this._multiSelectService.chooseAll();
  }

  interractWithLecture(lecture: ILecture, arr: ILecture[], idx: number) {
    switch (this.lecturesMode) {
      case LecturePostMode.play_audio:
        this._audioPlayerService.setData(arr, idx);
        break;
      case LecturePostMode.open_lecture_page:
        this._router.navigateByUrl("/lecture/" + lecture.id);
      case LecturePostMode.select:
        this._multiSelectService.toggleLectureSelect(lecture.id);
      default:
        break;
    }
  }

  setLectureMode() {
    if (this.isSelectMode) {
      this.lecturesMode = LecturePostMode.select;
      return;
    }
    if (this._lectureMethodsService.showRequest === PlaybackMode.AUDIOS) {
      this.lecturesMode = LecturePostMode.play_audio;
    } else {
      this.lecturesMode = LecturePostMode.open_lecture_page;
    }
  }

  removeFromFavorites() {
    this._favoritesService.toggleSelectedFavorites(FavoritesAction.DELETE);
  }
  addSelectedToPlaylist() {
    this._modalService.addToPlaylist(
      this._multiSelectService.getSelectedLectures
    );
  }
}
