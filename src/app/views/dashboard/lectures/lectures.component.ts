import { Component, EventEmitter, Input, OnInit } from "@angular/core";

import { PaginationService } from "src/app/services/pagination.service";
import { FilterService } from "./../../../services/filter.service";
import { GlobalStateService } from "./../../../services/global-state.service";
import { LecturesService } from "./../../../services/lectures.service";

import { Router } from "@angular/router";
import {
  ILecture,
  LecturePostMode,
  PlaybackMode,
} from "src/app/models/lecture";
import { IPlayerQueryParams } from "src/app/models/player";
import { searchTypes } from "src/app/models/playlists";
import { AudioplayerService } from "src/app/services/audioplayer.service";
import { DeepSearchService } from "src/app/services/deep-search.service";
import { MultiSelectService } from "src/app/services/multi-select.service";

@Component({
  selector: "app-lectures",
  templateUrl: "./lectures.component.html",
  styleUrls: ["../dashboard.component.scss", "./lectures.component.scss"],
})
export class LecturesComponent implements OnInit {
  @Input() allLectures: ILecture[] = this._lecturesService.allLectures;
  @Input() isMyPlaylist: boolean;
  @Input() isFavoritesPlaylist: boolean;
  @Input() playlistID: string;
  onFilteredLecturesChange: EventEmitter<boolean> = new EventEmitter();

  lecturesMode: LecturePostMode = LecturePostMode.open_lecture_page;
  isSelectMode = false;
  isLecturesLoading = false;

  get searchRequest() {
    return this._globalState.searchRequest;
  }

  get sortRequest() {
    this.setLectureMode();
    return this._globalState.sortRequest;
  }

  get showRequest() {
    return this._globalState.showRequest;
  }

  get searchType() {
    return this._globalState.searchType;
  }

  lecturesData: ILecture[] = [];
  allFilteredLectures: ILecture[] = [];

  public searchedLecturesItems: { id: number; count: number }[] = [];
  countById(id: number) {
    if (!this.searchedLecturesItems.length) {
      return 0;
    }
    return this.searchedLecturesItems.find(item => item.id === id)?.count;
  }
  readonly pageSize = 20;

  constructor(
    public _lecturesService: LecturesService,
    public _filterService: FilterService,
    private _paginationService: PaginationService,
    private _globalState: GlobalStateService,
    private _multiSelectService: MultiSelectService,
    private _router: Router,
    private _audioPlayerService: AudioplayerService,
    private _deepSearchService: DeepSearchService
  ) {
    this._globalState.onFilterChanged.subscribe(() => {
      this.initLecturesFirstPage();
    });

    this._globalState.onFilterApply.subscribe(() => {
      this.initLecturesFirstPage();
    });

    this._globalState.onSortChanged.subscribe(() => {
      this.initLecturesFirstPage();
    });

    this._globalState.onHistorySortChanged.subscribe(() => {
      this.initLecturesFirstPage();
    });

    this._globalState.onFavoritesChanged.subscribe(() => {
      this.initLecturesFirstPage();
    });

    this._globalState.onPageIndexChanged.subscribe(pageIndex => {
      const nexPage = this.getPaginatedLectures(
        this.allFilteredLectures,
        this._paginationService.pageIndex
      );

      this.lecturesData = this.lecturesData.concat(nexPage);
    });
    this._multiSelectService.onSelectMode.subscribe(() => {
      this.isSelectMode = this._multiSelectService.isSelectMode;
      this.setLectureMode();
    });
    this._multiSelectService.onSelectAfterSearch.subscribe(() => {
      this._multiSelectService.setSelectAllLectures(
        this.allFilteredLectures.map(l => l.id)
      );
    });
  }

  ngOnInit(): void {
    this._paginationService.pageIndex = 1;
    this.initLecturesFirstPage();
  }

  async initLecturesFirstPage() {
    if (this.searchType === searchTypes.DEFAULT) {
      this.lecturesData = this.getLecturesFirstPage();
      return;
    }

    if (this.searchType === searchTypes.DEEP) {
      this.isLecturesLoading = true;

      this._deepSearchService.search(this.searchRequest)?.subscribe({
        next: data => {
          if (!data) {
            return;
          }
          this.searchedLecturesItems = data.data;
          this.lecturesData = this.getLecturesFirstPage();
          this.isLecturesLoading = false;
        },
        error: () => {
          this.isLecturesLoading = false;
        },
      });
    }
  }

  interractWithLecture(lecture: ILecture, arr: ILecture[], idx: number) {
    switch (this.lecturesMode) {
      case LecturePostMode.play_audio:
        this._audioPlayerService.setData(arr, idx);
        break;
      case LecturePostMode.open_lecture_page:
        this._router.navigate(["/lecture/", lecture.id], {
          queryParams: this.generateQueryParams(),
        });
        break;
      case LecturePostMode.select:
        this._multiSelectService.toggleLectureSelect(lecture.id);
      default:
        break;
    }
  }

  private generateQueryParams(): IPlayerQueryParams {
    if (this.playlistID) {
      return {
        videoListType: "playlist",
        videoListParams: this.playlistID,
      };
    }
    if (this.isFavoritesPlaylist) {
      return {
        videoListType: "favorites",
        videoListParams: null,
      };
    }
    return {
      videoListType: "all",
      videoListParams: null,
    };
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

  getLecturesFirstPage() {
    let filteredLecture: ILecture[] = [];

    if (this._globalState.searchType === searchTypes.DEEP) {
      if (!this.searchedLecturesItems) {
        return;
      }

      filteredLecture = this.filterLecturesByIds(
        this.allLectures,
        this.searchedLecturesItems
      );
    } else {
      filteredLecture = this.filterLectures(
        this.allLectures,
        this.searchRequest,
        this.showRequest
      );
    }

    this.allFilteredLectures = this.sortLectures(
      filteredLecture,
      this.sortRequest
    );

    if (this.allFilteredLectures.length > 0) {
      this._multiSelectService.searchSelectTrigger(true);
    } else {
      this._multiSelectService.searchSelectTrigger(false);
    }
    return this.getPaginatedLectures(this.allFilteredLectures, 1);
  }

  private filterLectures(
    lectures: ILecture[],
    searchRequest: string,
    showRequest: string
  ) {
    let filteredByShowRequest = this.filterLecturesByShowRequest(
      lectures,
      showRequest
    );

    filteredByShowRequest = this.filterLecturesByVariants(
      filteredByShowRequest
    );

    if (searchRequest == null || searchRequest.trim() === "") {
      return filteredByShowRequest;
    }

    const trimmedSearchRequest = searchRequest.toLowerCase().trim();

    const filteredBySortRequest = filteredByShowRequest?.filter(x => {
      const isSubstringOfTitle = x.title
        ?.join(" ")
        .trim()
        .toLowerCase()
        .includes(trimmedSearchRequest);
      const isEqualByAdvanced = x.search.advanced
        .join(" ")
        ?.toLowerCase()
        .trim()
        .includes(trimmedSearchRequest.toLowerCase().trim());

      return isSubstringOfTitle || isEqualByAdvanced;
    });

    return filteredBySortRequest;
  }

  private filterLecturesByShowRequest(
    lectures: ILecture[],
    showRequest: string
  ) {
    if (showRequest.trim() != PlaybackMode.VIDEOS) {
      return lectures;
    }

    return lectures.filter(
      x => x.resources.videos != null && x.resources.videos.length > 0
    );
  }

  private filterLecturesByVariants(lectures: ILecture[]) {
    // this._globalState.setSortRequest("Rec date (oldest first)");
    console.log("FILTERING LECTURES");

    const filterLecturesByLanguage = () => {
      if (!this._filterService.allActiveFilters.languages.length) {
        return lectures;
      }

      return lectures.filter(x =>
        this._filterService.allActiveFilters.languages.includes(x.language.main)
      );
    };

    lectures = filterLecturesByLanguage();

    const filterLecturesByCountries = () => {
      if (!this._filterService.allActiveFilters.countries.length) {
        return lectures;
      }

      return lectures.filter(x =>
        this._filterService.allActiveFilters.countries.includes(
          x.location.country
        )
      );
    };

    lectures = filterLecturesByCountries();

    const filterLecturesByPlace = () => {
      if (!this._filterService.allActiveFilters.place.length) {
        return lectures;
      }

      return lectures.filter(x =>
        this._filterService.allActiveFilters.place.includes(x.place[0])
      );
    };

    lectures = filterLecturesByPlace();

    const filterLecturesByYears = () => {
      if (!this._filterService.allActiveFilters.years.length) {
        return lectures;
      }

      return lectures.filter(x =>
        this._filterService.allActiveFilters.years.includes(
          x.dateOfRecording.year
        )
      );
    };

    lectures = filterLecturesByYears();

    const filterLecturesByMonth = () => {
      if (!this._filterService.allActiveFilters.month.length) {
        return lectures;
      }

      return lectures.filter(x => {
        let monthNumber;

        switch (x.dateOfRecording.month) {
          case "01":
            monthNumber = "January";
            break;
          case "02":
            monthNumber = "February";
            break;
          case "03":
            monthNumber = "March";
            break;
          case "04":
            monthNumber = "April";
            break;
          case "05":
            monthNumber = "May";
            break;
          case "06":
            monthNumber = "June";
            break;
          case "07":
            monthNumber = "July";
            break;
          case "08":
            monthNumber = "August";
            break;
          case "09":
            monthNumber = "September";
            break;
          case "10":
            monthNumber = "October";
            break;
          case "11":
            monthNumber = "November";
            break;
          case "12":
            monthNumber = "December";
            break;
        }

        if (monthNumber) {
          return this._filterService.allActiveFilters.month.includes(
            monthNumber
          );
        }
      });
    };

    lectures = filterLecturesByMonth();

    const filterLecturesByCategories = () => {
      if (!this._filterService.allActiveFilters.categories?.length) {
        return lectures;
      }

      return lectures.filter(x => {
        if (x.category?.length) {
          return this._filterService.allActiveFilters.categories.includes(
            x.category[0]
          );
        }
      });
    };

    lectures = filterLecturesByCategories();

    const filterLecturesByTranslations = () => {
      if (!this._filterService.allActiveFilters.translation.length) {
        return lectures;
      }

      return lectures.filter(x => {
        if (x.language.translations?.length) {
          return this._filterService.allActiveFilters.translation.includes(
            x.language.translations[0]
          );
        }
      });
    };

    lectures = filterLecturesByTranslations();

    return lectures;
  }

  private filterLecturesByIds(
    lectures: ILecture[],
    searchedLectures: { id: number; count: number }[]
  ) {
    const ids = searchedLectures.map(item => item.id);
    const filteredLectures = lectures.filter(lecture =>
      ids.includes(lecture.id)
    );
    const filteredLecturesWithMentions = filteredLectures.map(lecture => {
      const currentMentionCount = searchedLectures.find(
        _lecture => _lecture.id === lecture.id
      ).count;
      return { ...lecture, mentions: currentMentionCount };
    });
    return filteredLecturesWithMentions;
  }

  private getPaginatedLectures(allLectures: ILecture[], pageIndex: number) {
    const offset = (pageIndex - 1) * this.pageSize;

    // if (this._router.url === "/dashboard/top") {
    //   return allLectures;
    // } else {
    // }
    return allLectures.slice(offset, pageIndex * this.pageSize);
  }

  private sortLectures(lectures: ILecture[], sortType: string) {
    const sortFuction = this.getSortFunction(sortType);

    if (sortFuction == null) {
      return lectures;
    }

    if (this._globalState.sortRequest === "Verse number") {
      const lecturesWithVerseNumber = [
        ...lectures.filter(l => l.legacyData.verse),
        ...lectures.filter(l => !l.legacyData.verse),
      ];

      return lecturesWithVerseNumber.sort(sortFuction);
      return lecturesWithVerseNumber;
    }

    return lectures.sort(sortFuction);
  }

  private getSortFunction(
    sortType: string
  ): (a: ILecture, b: ILecture) => number {
    switch (sortType) {
      case "Default View":
      case "":
      case undefined: {
        return null;
      }
      case "Duration (low to high)": {
        return (a, b) => a.length - b.length;
      }
      case "Duration (high to low)": {
        return (a, b) => b.length - a.length;
      }
      case "Rec date (oldest first)": {
        return (a, b) =>
          new Date(
            +a?.dateOfRecording.year,
            +a?.dateOfRecording.month - 1,
            +a?.dateOfRecording.day
          ).getTime() -
          new Date(
            +b?.dateOfRecording.year,
            +b?.dateOfRecording.month - 1,
            +b?.dateOfRecording.day
          ).getTime();
      }
      case "Rec date (latest first)": {
        return (a, b) =>
          new Date(
            +b?.dateOfRecording.year,
            +b?.dateOfRecording.month - 1,
            +b?.dateOfRecording.day
          ).getTime() -
          new Date(
            +a?.dateOfRecording.year,
            +a?.dateOfRecording.month - 1,
            +a?.dateOfRecording.day
          ).getTime();
      }
      case "Alphabetically (A-Z)": {
        return (a, b) => (a.title > b.title ? 1 : -1); // TODO: fix sort
      }
      case "Alphabetically (Z-A)": {
        return (a, b) => (b.title > a.title ? 1 : -1); // TODO: fix sort
      }
      case "Verse number": {
        return (a, b) => (a.legacyData.verse > b.legacyData.verse ? -1 : 1);
      }
      case "Mentions": {
        return (a, b) => b.mentions - a.mentions;
      }
    }

    return null;
  }

  ngOnChanges(changes: any) {
    this.allLectures = changes.allLectures.currentValue;
    this.initLecturesFirstPage();
  }
}
