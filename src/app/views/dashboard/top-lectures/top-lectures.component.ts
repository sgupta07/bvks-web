import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MultiSelectService } from "./../../../services/multi-select.service";

import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";

import { TuiDialogService } from "@taiga-ui/core";
import { FilterService } from "./../../../services/filter.service";
import { GlobalStateService } from "./../../../services/global-state.service";
import { LecturesService } from "./../../../services/lectures.service";
import { PaginationService } from "./../../../services/pagination.service";
import { SearchService } from "./../../../services/search.service";

import { DownloadsService } from "src/app/services/downloads.service";
import {
  ILecture,
  LecturePostMode,
  PlaybackMode,
} from "./../../../models/lecture";

import { AudioplayerService } from "src/app/services/audioplayer.service";
import { LecturesProgressService } from "src/app/services/lectures-progress.service";

import { FavoritesService } from "src/app/services/favorites.service";
import { ModalService } from "src/app/services/modal.service";
import { NavigateBackService } from "src/app/services/navigate-back.service";
import { FilterComponent } from "./../../../components/filter/filter.component";

@Component({
  selector: "app-top-lectures",
  templateUrl: "./top-lectures.component.html",
  styleUrls: ["./top-lectures.component.scss"],
})
export class TopLecturesComponent implements OnInit {
  activeLecture: ILecture;
  activePlayList: any;
  oldLectures: any;
  isSelectMode = false;
  isLecturePopupActive = false;
  selectedLecturesLength: number;
  form: FormGroup;
  isSelectAfterSearch = false;
  lecturesMode: LecturePostMode = LecturePostMode.play_audio;

  get activeFiltersCount(): number {
    return this._filterService.getAllActiveFiltersCount();
  }

  get topLectures(): any[] {
    return this._lecturesService.topLectures;
  }

  get popularLecturesIsReady(): boolean {
    return this._lecturesService.popularLecturesIsReady;
  }

  get searchRequest() {
    return this._globalState.searchRequest;
  }

  get sortRequest() {
    return this._globalState.sortRequest;
  }

  get showRequest() {
    this.setLectureMode();

    return this._globalState.showRequest;
  }

  get periodRequest() {
    return this._globalState.periodRequest;
  }

  set showRequest(value: PlaybackMode) {
    this._globalState.showRequest = value;
  }
  set sortRequest(value: string) {
    this._globalState.sortRequest = value;
  }
  set searchRequest(value: string) {
    this._globalState.searchRequest = value;
  }
  set periodRequest(value: string) {
    this._globalState.periodRequest = value;
  }

  constructor(
    public _lecturesService: LecturesService,
    public _filterService: FilterService,
    private _multiSelectService: MultiSelectService,
    private route: ActivatedRoute,
    private _paginationService: PaginationService,
    private _dialogService: TuiDialogService,
    private _searchService: SearchService,
    private _downloadService: DownloadsService,
    private _lectureProgressService: LecturesProgressService,
    private _globalState: GlobalStateService,
    private _router: Router,
    private _audioPlayerService: AudioplayerService,
    @Inject(NavigateBackService)
    private _navigateBackService: NavigateBackService,
    private _favortieService: FavoritesService,
    private _modalService: ModalService
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

  ngOnInit(): void {
    this._navigateBackService.oldPath = this._router.url;
    console.log(this._router.url);

    this.isSelectMode = this._multiSelectService.isSelectMode;

    this.form = new FormGroup({
      show: new FormControl(null),
      sort: new FormControl(null),
      filter: new FormControl(null),
      period: new FormControl(null),
    });

    this._paginationService.pageIndex = 1;
    this.periodRequest = "All-time";
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

  closeLecturePopup() {
    this.isLecturePopupActive = false;
  }

  async showDialog() {
    await this.dialog.toPromise();
  }

  isSortRequests(): boolean {
    return (
      !this.searchRequest.trim() &&
      this.sortRequest == "Default View" &&
      !this.activeFiltersCount &&
      this.showRequest == PlaybackMode.AUDIOS
    );
  }

  setLectureMode() {
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

  toggleSelectMode() {
    this._multiSelectService.toggleSelectMode();
  }

  selectAll() {
    if (
      this.activeFiltersCount === 0 &&
      !this._globalState.searchRequest.length &&
      this.sortRequest === "Default View" &&
      this.showRequest !== PlaybackMode.VIDEOS
    ) {
      this._multiSelectService.setSelectAllLectures(
        this._lecturesService.topLectures.map(l => l.id)
      );
    }
    this._multiSelectService.chooseAll();
  }

  addSelectedToFavorites() {
    this._favortieService.addSelectedLecturesToFavorites();

    this._multiSelectService.unchooseAll();
  }
  markSelectedAsCompleted() {
    this._multiSelectService.selectedLectures.forEach(lecture => {
      this._lectureProgressService.markAsComplete(lecture);
    });
    this._multiSelectService.unchooseAll();
  }

  addSelectedToPlaylist() {
    this._modalService.addToPlaylist(
      this._multiSelectService.getSelectedLectures
    );
    this._multiSelectService.unchooseAll();
  }
}
