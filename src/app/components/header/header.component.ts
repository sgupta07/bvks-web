import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { IUrlWithoutSearch } from "./../../models/short-url-data";

import { AuthorizationService } from "./../../services/authorization.service";
import { DashboardService } from "./../../services/dashboard.service";
import { FilterService } from "./../../services/filter.service";
import { GlobalStateService } from "./../../services/global-state.service";
import { LecturesService } from "./../../services/lectures.service";
import { PaginationService } from "./../../services/pagination.service";
import { SearchService } from "./../../services/search.service";

import { Location } from "@angular/common";
import { searchModes, searchTypes } from "src/app/models/playlists";
import { DeepSearchService } from "src/app/services/deep-search.service";
import { MultiSelectService } from "src/app/services/multi-select.service";
import { NavigateBackService } from "src/app/services/navigate-back.service";
import { LocalStorage } from "src/libs/storage/src";
import { PlaybackMode } from "./../../models/lecture";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
  changeDetection: ChangeDetectionStrategy.Default,
  host: {
    "(document:click)": "onDropdownClick($event)",
  },
})
export class HeaderComponent implements OnInit {
  @ViewChild("button") button: ElementRef;

  searchCategory = "";
  searchFieldText = `Search here (E.g. surrender, love, Bg 4.34, SB 8.19.19, etc.)`;
  form: FormGroup;
  shortUserName: string;
  userEmail: string;
  userName: string;
  searchMode: searchModes = searchModes.LECTURES;
  searchTitle = "lectures";
  isDropdownActive = false;
  isSearchTypeDropdownActive = false;
  timeOut: any;
  search = "";
  isBackBtnActive = false;
  previousUrl: string;
  currentUrl: string;
  isSearchDisabled = false;
  searchType: searchTypes = searchTypes.DEFAULT;

  private history: string[] = [];

  get isMenuActive(): boolean {
    return this._dashboardService.isMenuActive;
  }

  set isMenuActive(value: boolean) {
    this._dashboardService.isMenuActive = value;
  }

  set searchRequest(request: string) {
    this._filterService.search = request;
  }

  constructor(
    private _authorizationService: AuthorizationService,
    private _filterService: FilterService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _dashboardService: DashboardService,
    private _searchService: SearchService,
    private _deepSearchService: DeepSearchService,
    private _lecturesService: LecturesService,
    private _paginationService: PaginationService,
    private _globalState: GlobalStateService,
    @Inject(NavigateBackService)
    private _navigateBackService: NavigateBackService,
    private _localStorage: LocalStorage,
    private _multiselectService: MultiSelectService,
    private _location: Location
  ) {
    // if route changed
    this._router.events.subscribe(x => {
      if (x instanceof NavigationEnd) {
        this.resetSearch();
      }
      if (x instanceof NavigationEnd) {
        this.history.push(x.urlAfterRedirects);
      }
      this.checkSearchMode();
    });
    this._activatedRoute.url.subscribe(value => {
      const childRoute = this._router.url.split("/dashboard/")[1];
      const routesWithSerch = [
        "categories",
        "top",
        "playlists",
        "favorites",
        "history",
      ];
      if (routesWithSerch.includes(childRoute)) {
        this.isSearchDisabled = false;
      } else {
        this.isSearchDisabled = true;
      }
      if (childRoute === IUrlWithoutSearch.FAVORITES) {
        this.searchFieldText = "Search favorites here";
      }
      if (childRoute === IUrlWithoutSearch.PLAYLISTS) {
        this.searchFieldText = "Search playlists here";
      }
      if (childRoute === IUrlWithoutSearch.POPULAR) {
        this.searchFieldText = "Search popular here";
      }
      if (childRoute === IUrlWithoutSearch.HISTORY) {
        this.searchFieldText = "Search history here";
      }
      if (childRoute === IUrlWithoutSearch.CATEGORIES) {
        this.searchFieldText =
          "Search here (E.g. surrender, love, Bg 4.34, SB 8.19.19, etc.)";
      }

      const url = value[0].path;
      if (url === "lecture") {
        this.isBackBtnActive = true;
      }
    });
  }

  ngOnInit(): void {
    this._dashboardService.onSearchFieldPlaceholderChange.subscribe(
      (text: string) => {
        this.searchFieldText = text;
      }
    );

    this.checkSearchMode();
    this.form = new FormGroup({
      search: new FormControl({ value: "search", disabled: true }, [
        Validators.required,
      ]),
    });

    this.shortUserName = this.getShortUserName();
    this.userName = this.getUserName();
  }

  // goToPreviousPage() {
  //   this._navigateBackService.videoMode = true;

  //   this._navigateBackService.navigateBack();
  // }

  goToPreviousPage() {
    window.history.back();
  }

  checkSearchMode() {
    const isPlaylists = this._router.url.split("/").includes("playlists");
    const urlLength = this._router.url.split("/").length;
    if (isPlaylists && urlLength === 3) {
      this.searchMode = searchModes.PLAYLISTS;
      this.searchTitle = searchModes.PLAYLISTS;
    } else {
      this.searchMode = searchModes.LECTURES;
      this.searchTitle = searchModes.LECTURES;
    }
  }

  getShortUserName() {
    const userData = JSON.parse(this._localStorage.getItem("user"));

    let visibleName;

    if (userData.email) {
      visibleName = userData.email.slice(0, 2).toUpperCase();
    } else if (userData.displayName) {
      const nameArr = userData.displayName.split(" ");

      visibleName = `${nameArr[0][0]}${nameArr[1][0]}`.toUpperCase();
    }

    return visibleName;
  }

  onDropdownClick(event: any) {
    if (
      this.button.nativeElement &&
      this.button.nativeElement.contains(event.target)
    ) {
      this.isDropdownActive = !this.isDropdownActive;
      this.isSearchTypeDropdownActive = false;
    }
  }

  getUserName() {
    return JSON.parse(this._localStorage.getItem("user")).email
      ? JSON.parse(this._localStorage.getItem("user")).email
      : JSON.parse(this._localStorage.getItem("user")).displayName;
  }

  searchLectures(search: string, searchType = searchTypes.DEFAULT) {
    if (this.searchMode === searchModes.LECTURES) {
      clearTimeout(this.timeOut);
      this.timeOut = setTimeout(async () => {
        if (this.search?.trim().length > 1 || this.search?.trim().length == 0) {
          this.searchRequest = search;
          this._globalState.searchRequest = search;
          return;
        }
      }, 350);
      this._multiselectService.searchSelectTrigger(true);
    } else {
      clearTimeout(this.timeOut);
      this.timeOut = setTimeout(async () => {
        if (this.search?.trim().length > 1 || this.search?.trim().length == 0) {
          this._globalState.playlistsSearchRequest = search;
          return;
        }
      }, 350);
    }

    if (this.search?.trim().length > 0) {
      this._globalState.searchType = searchType;

      if (this._globalState.searchType === searchTypes.DEEP) {
        this._globalState.setSortRequest("Mentions");
      } else {
        this._globalState.setSortRequest("Rec date (latest first)");
      }
    } else {
      this._globalState.setSortRequest("Default View");
    }
  }

  onSearchLecturesChange(search: string | undefined) {
    if (!search) {
      this._globalState.searchRequest = search;
      this.searchLectures("");
    }
  }

  private resetSearch() {
    this.search = "";
    this._globalState.searchRequest = "";
    this._multiselectService.searchSelectTrigger(false);
  }

  logOut() {
    this.toggleDropdown();
    this._authorizationService.logOut();
  }

  toggleMenu() {
    this.isMenuActive = !this.isMenuActive;
  }

  toggleDropdown() {
    this.isDropdownActive = !this.isDropdownActive;
  }

  toggleSearchTypeDropdown() {
    this.isSearchTypeDropdownActive = !this.isSearchTypeDropdownActive;
  }

  clearFilters() {
    this._globalState.searchRequest = "";
    this.search = "";
    this._globalState.sortRequest = "Default View";
    this._globalState.showRequest = PlaybackMode.AUDIOS;
    this._multiselectService.searchSelectTrigger(false);
    this._filterService.clearActiveFilters();
  }

  isLecturesEmpty() {
    if (!this._lecturesService.lectures) {
      this.form.get("search").disable();

      return;
    }

    this.form.get("search").enable();
  }

  // onChangeSearchType(type: searchTypes) {
  //   this.searchType = type;
  //   this._globalState.searchType = type;
  //   this.toggleSearchTypeDropdown();
  // }

  handleDeepSearch() {
    this.searchLectures(this.search, searchTypes.DEEP);
  }
}
