import { ActivatedRoute, Router } from "@angular/router";
import { AudioplayerService } from "src/app/services/audioplayer.service";
import { GlobalStateService } from "src/app/services/global-state.service";

import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Subscription } from "rxjs";
import { MultiSelectService } from "./../../services/multi-select.service";
import { SearchService } from "./../../services/search.service";

import { FilterService } from "./../../services/filter.service";
import { LecturesService } from "./../../services/lectures.service";
import { PaginationService } from "./../../services/pagination.service";

import { NavigateBackService } from "src/app/services/navigate-back.service";
import { PlaybackMode } from "./../../models/lecture";

import { Location } from "@angular/common";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  search: string;
  sort: string;
  form: FormGroup;
  isSelectMode = false;
  selectedLecturesLength: number;
  progressLineWidth: number = 0;

  oldLectures: any;

  showRequestText: string;
  selectModeSub: Subscription;

  get allLectures(): any {
    return this._lecturesService.allLectures;
  }

  get searchRequest() {
    return this._lectureMethodsService.searchRequest;
  }

  get sortRequest() {
    return this._lectureMethodsService.sortRequest;
  }

  get showRequest() {
    return this._lectureMethodsService.showRequest;
  }

  set showRequest(value: PlaybackMode) {
    this._lectureMethodsService.showRequest = value;
  }
  set sortRequest(value: string) {
    this._lectureMethodsService.sortRequest = value;
  }
  set searchRequest(value: string) {
    this._lectureMethodsService.searchRequest = value;
  }

  constructor(
    public _lecturesService: LecturesService,
    public _filterService: FilterService,
    private _paginationService: PaginationService,
    private _searchService: SearchService,
    private _globalState: GlobalStateService,
    private _audioPlayerService: AudioplayerService,
    private _lectureMethodsService: GlobalStateService,
    private _multiSelectService: MultiSelectService,
    @Inject(NavigateBackService)
    private _navigateBackService: NavigateBackService,
    private _location: Location,
    private _router: Router,
    private route: ActivatedRoute
  ) {
    this._multiSelectService.onSelectedLecturesChange.subscribe(() => {
      this.selectedLecturesLength =
        this._multiSelectService.selectedLectures.length;
    });
    this._multiSelectService.onSelectMode.subscribe(() => {
      this.isSelectMode = this._multiSelectService.isSelectMode;
    });
    this.route.url.subscribe(() => {
      this._multiSelectService.unchooseAll();
      this._multiSelectService.searchSelectTrigger(false);

      this.activateAudioPlayer();
    });

    if (this._navigateBackService.videoMode) {
      this._globalState.showRequest = PlaybackMode.VIDEOS;

      this._navigateBackService.videoMode = false;
    }
  }

  ngOnInit(): void {
    this.isSelectMode = this._multiSelectService.isSelectMode;
    this.form = new FormGroup({
      show: new FormControl(null),
      sort: new FormControl(null),
      filter: new FormControl(null),
    });

    this.selectedLecturesLength =
      this._multiSelectService.selectedLectures.length;
  }

  ngOnDestroy(): void {}

  toggleSelectMode() {
    // if(this.isSelectMode){
    //   this._multiSelectService.unchooseAll()
    // }
    this._multiSelectService.toggleSelectMode();
  }

  // selectAll() {
  //   this._multiSelectService.chooseAll();
  // }

  isSortRequests(): boolean {
    if (this.searchRequest.trim() || this.sortRequest !== "Default View") {
      return true;
    }

    return false;
  }

  onSortChange() {
    if (this.showRequest === PlaybackMode.VIDEOS) {
      return;
    }

    this._paginationService.setLecturesLimit(1);

    if (!this.searchRequest) {
      this._paginationService.paginateAll(this._lecturesService.allLectures);

      return;
    }

    this._paginationService.paginateAll(
      this._searchService.allSearchedLectures
    );
  }

  private async activateAudioPlayer() {
    const queryParams = this.route.snapshot.queryParams;

    if (!queryParams?.start_point && !queryParams?.lecture_id) {
      return;
    }

   // const lecture = await this._lecturesService.getLectureByIdFromFirebase(
   //   +queryParams?.lecture_id
   // );

    //this._audioPlayerService.setData([...lecture], 0, queryParams.start_point);
  }
}
