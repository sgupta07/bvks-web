import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MultiSelectService } from "./../../../services/multi-select.service";
import { Paginator } from "./../base-lectures-container";

import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";

import { FilterService } from "./../../../services/filter.service";
import { GlobalStateService } from "./../../../services/global-state.service";
import { HistoryService } from "./../../../services/history.service";
import { SortService } from "./../../../services/sort.service";

import { FilterComponent } from "./../../../components/filter/filter.component";

import { TuiDialogService } from "@taiga-ui/core";
import { AudioplayerService } from "src/app/services/audioplayer.service";
import { DownloadsService } from "src/app/services/downloads.service";
import { LecturesProgressService } from "src/app/services/lectures-progress.service";
import { NavigateBackService } from "src/app/services/navigate-back.service";
import { environment } from "src/environments/environment";
import {
  ILecture,
  LecturePostMode,
  PlaybackMode,
} from "./../../../models/lecture";
@Component({
  selector: "app-history-page",
  templateUrl: "./history-page.component.html",
  styleUrls: ["./history-page.component.scss"],
})
export class HistoryPageComponent implements OnInit {
  activeLecture: ILecture;
  activePlayList: ILecture[];
  isLecturePopupActive = false;
  form: FormGroup;
  isSelectMode = false;
  sortedLectures: ILecture[] = [];
  selectedLecturesLength: number;
  data: ILecture[];
  dataToRender: ILecture[] = [];
  paginator: Paginator;
  isSelectAfterSearch = false;
  lecturesMode: LecturePostMode = LecturePostMode.play_audio;

  get historyLecturesIsLoaded(): boolean {
    return this._historyService.historyLecturesIsReady;
  }

  get lectures() {
    return this._historyService.allLectures;
  }

  get lecturesByWeek() {
    return this._historyService.allLecturesByWeek;
  }

  get lecturesByMonth() {
    return this._historyService.allLecturesByMonth;
  }

  get activeFiltersCount(): number {
    return this._filterService.getAllActiveFiltersCount();
  }

  get historyRequest() {
    return this._lectureMethodsService.historyRequest;
  }

  set historyRequest(value: string) {
    this._lectureMethodsService.historyRequest = value;
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
    private _lectureMethodsService: GlobalStateService,
    private _multiSelectService: MultiSelectService,
    private _dialogService: TuiDialogService,
    private route: ActivatedRoute,
    private _historyService: HistoryService,
    private _globalStateService: GlobalStateService,
    private _filterService: FilterService,
    private _downloadService: DownloadsService,
    @Inject(NavigateBackService)
    private _navigateBackService: NavigateBackService,
    private _lectureProgressService: LecturesProgressService,
    private _router: Router,
    private _audioPlayerService: AudioplayerService
  ) {
    this.route.url.subscribe(() => this._multiSelectService.unchooseAll());
  }

  ngOnInit() {
    this.isSelectMode = this._multiSelectService.isSelectMode;

    this.form = new FormGroup({
      show: new FormControl(null),
      sort: new FormControl(null),
      history: new FormControl(null),
      filter: new FormControl(null),
    });

    this._navigateBackService.oldPath = this._router.url;
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

  async showDialog() {
    await this.dialog.toPromise();
  }

  closeLecturePopup() {
    this.isLecturePopupActive = false;
  }

  isSortRequests(): boolean {
    return (
      !this.searchRequest.trim() &&
      this.historyRequest === "All history" &&
      this.sortRequest == "Default View" &&
      !this.activeFiltersCount &&
      this.showRequest == PlaybackMode.AUDIOS
    );
  }

  markSelectedAsCompleted() {
    this._multiSelectService.selectedLectures.forEach(lecture => {
      this._lectureProgressService.markAsComplete(lecture);
    });
    this._multiSelectService.unchooseAll();
  }

  toggleSelectMode() {
    // if(this.isSelectMode){
    //   this._multiSelectService.unchooseAll()
    // }
    this._multiSelectService.toggleSelectMode();
  }

  sortLecturesByPeriod() {
    if (this.historyRequest === "This week") {
      this.sortedLectures.length = 0;
      this.sortedLectures.push(...this.lecturesByWeek);
    } else if (this.historyRequest === "This month") {
      this.sortedLectures.length = 0;
      this.sortedLectures.push(...this.lecturesByMonth);
    } else {
      this.sortedLectures.length = 0;
      this.sortedLectures.push(...this.lectures);
    }

    this._lectureMethodsService.onHistorySortChanged.emit();
  }

  async clearHistory() {
    await this._historyService.clearHistory();
    this.sortLecturesByPeriod();
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
}
