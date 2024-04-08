import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { IPlaylist } from "./../../../models/user";
import { MultiSelectService } from "./../../../services/multi-select.service";

import { TuiDialogService } from "@taiga-ui/core";
import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";

import { FilterComponent } from "./../../../components/filter/filter.component";

import { AudioplayerService } from "src/app/services/audioplayer.service";
import { DownloadsService } from "src/app/services/downloads.service";
import { FavoritesService } from "src/app/services/favorites.service";
import { LecturesProgressService } from "src/app/services/lectures-progress.service";
import { ModalService } from "src/app/services/modal.service";
import { NavigateBackService } from "src/app/services/navigate-back.service";
import { PlaylistsService } from "src/app/services/playlists.service";
import {
  ILecture,
  LecturePostMode,
  PlaybackMode,
} from "./../../../models/lecture";
import { FilterService } from "./../../../services/filter.service";
import { GlobalStateService } from "./../../../services/global-state.service";
import { LecturesService } from "./../../../services/lectures.service";
import { PaginationService } from "./../../../services/pagination.service";

@Component({
  selector: "app-categories",
  templateUrl: "./categories.component.html",
  styleUrls: ["../dashboard.component.scss", "./categories.component.scss"],
})
export class CategoriesComponent implements OnInit {
  isLecturePopupActive = false;
  form: FormGroup;
  oldLectures: any;
  isSelectMode = false;
  isFilterVisible = false;
  selectedLecturesLength: number;
  lecturesMode: LecturePostMode = LecturePostMode.play_audio;

  lecturesByCategories: any;
  lastestlectures: ILecture[] = [];
  topLectures: ILecture[] = [];
  latestInEnglish: ILecture[] = [];
  englishInHindi: ILecture[] = [];
  bengalian: ILecture[] = [];
  bhagavad: ILecture[] = [];
  srimadBhagavatam: ILecture[] = [];
  caritamrta: ILecture[] = [];
  visnu: ILecture[] = [];

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

  get lecturesByCatIsReady(): boolean {
    return this._lecturesService.lecturesByCatIsReady;
  }

  get recommendedPlaylists(): IPlaylist[] {
    return this._playlistsService.getRecommendedPlaylists;
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

  get activeFiltersCount(): number {
    return this._filterService.getAllActiveFiltersCount();
  }

  set showRequest(value: PlaybackMode) {
    this._globalState.showRequest = value;
    this.setLectureMode();
  }
  set sortRequest(value: string) {
    this._globalState.sortRequest = value;
    this.setLectureMode();
  }
  set searchRequest(value: string) {
    this._globalState.searchRequest = value;
  }

  set filterRequest(value: string) {
    this._globalState.filterRequest = value;
  }

  constructor(
    public _lecturesService: LecturesService,
    public _filterService: FilterService,
    private route: ActivatedRoute,
    private _router: Router,
    private _multiSelectService: MultiSelectService,
    private _paginationService: PaginationService,
    private _dialogService: TuiDialogService,
    private _downloadService: DownloadsService,
    private _lectureProgressService: LecturesProgressService,
    private _globalState: GlobalStateService,
    private _audioPlayerService: AudioplayerService,
    private _favoriteService: FavoritesService,
    private _playlistsService: PlaylistsService,
    private _modalService: ModalService,
    @Inject(NavigateBackService)
    private _navigateBackService: NavigateBackService
  ) {
    this._multiSelectService.onSelectedLecturesChange.subscribe(() => {
      this.selectedLecturesLength =
        this._multiSelectService.selectedLectures.length;
    });
    this._multiSelectService.onSelectMode.subscribe(() => {
      this.isSelectMode = this._multiSelectService.isSelectMode;
      this.setLectureMode();
    });
    this.route.url.subscribe(() => this._multiSelectService.unchooseAll());

    this._globalState.onCategoryLecturesLoaded.subscribe(() => {
      this.lecturesByCategories = this._lecturesService.lecturesByCategories;
    });
  }

  ngOnInit(): void {
    this.lecturesByCategories = this._lecturesService.lecturesByCategories;

    this.isSelectMode = this._multiSelectService.isSelectMode;
    this.form = new FormGroup({
      show: new FormControl(null),
      sort: new FormControl(null),
      filter: new FormControl(null),
    });

    this._paginationService.pageIndex = 1;

    this.selectedLecturesLength =
      this._multiSelectService.selectedLectures.length;

    this._navigateBackService.oldPath = this._router.url;
  }

  downloadLectures() {
    const selectedLectures = this._multiSelectService.getSelectedLecturesIds();
    this._downloadService.addLecturesToDownloads(selectedLectures);

    this._multiSelectService.unchooseAll();
  }

  resetLimit() {
    this._paginationService.pageIndex = 1;
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

  interractWithLecture(
    lecture: ILecture,
    arr: ILecture[],
    idx: number,
    catName: string
  ) {
    switch (this.lecturesMode) {
      case LecturePostMode.play_audio:
        this._audioPlayerService.setData(arr, idx);
        break;
      case LecturePostMode.open_lecture_page:
        this._router.navigate(["/lecture/", lecture.id], {
          queryParams: {
            videoListType: "categories",
            videoListParams: catName,
          },
        });
        break;
      case LecturePostMode.select:
        this._multiSelectService.toggleLectureSelect(lecture.id);
      default:
        break;
    }
  }

  async showDialog() {
    await this.dialog.toPromise();
  }

  closeLecturePopup() {
    this.isLecturePopupActive = false;
  }

  isSortRequests(): boolean {
    return (
      !this.searchRequest.trim() &&
      this.sortRequest == "Default View" &&
      !this._filterService.getAllActiveFiltersCount()
    );
  }
  toggleFilter() {
    this.isFilterVisible = !this.isFilterVisible;
  }

  toggleSelectMode() {
    this._multiSelectService.toggleSelectMode();
  }

  selectAll() {
    if (
      this._filterService.getAllActiveFiltersCount() == 0 &&
      !this._filterService.searchValue.length &&
      this._globalState.sortRequest === "Default View"
    ) {
      const all: number[] = [];
      console.log("ALL", all);

      Object.values(this._lecturesService.lecturesByCategories).forEach(
        (lecArr: ILecture[]) => {
          lecArr.slice(0, 5).forEach((lec: ILecture) => {
            all.push(lec.id);
          });
        }
      );
      this._multiSelectService.setSelectAllLectures([...new Set(all)]);
    }
    this._multiSelectService.chooseAll();
  }

  addSelectedToFavorites() {
    this._favoriteService.addSelectedLecturesToFavorites();

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
  }
}
