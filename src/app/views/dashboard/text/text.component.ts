import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { TuiDialogService } from "@taiga-ui/core";
import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";
import { FilterComponent } from "src/app/components/filter/filter.component";
import {
  DeepSearchService,
  LectureSortDto,
} from "src/app/services/deep-search.service";
import { FilterService } from "src/app/services/filter.service";
import { GlobalStateService } from "src/app/services/global-state.service";
import { MultiSelectService } from "src/app/services/multi-select.service";

@Component({
  selector: "app-text",
  templateUrl: "./text.component.html",
  styleUrls: ["./text.component.scss"],
})
export class TextComponent implements OnInit {
  form: FormGroup;
  isSelectMode = false;
  selectedLecturesLength: number;
  search = "";
  searchString = "";
  searchError = "";
  searchFieldText = "Search lectures by text";
  sort = "";
  previousSortRequest = "Default View";
  textItems: any[] = [];
  isLoading = false;
  isEmpty = false;
  skip = 15;
  take = 0;
  index = 0;
  throttleTimer: any;
  showPopup = false;
  showHowSearch = true;
  constructor(
    public _filterService: FilterService,
    private _multiSelectService: MultiSelectService,
    private route: ActivatedRoute,
    private _globalState: GlobalStateService,
    private _dialogService: TuiDialogService,
    private _deepSearchService: DeepSearchService,
    private router: Router
  ) {
    this._multiSelectService.onSelectedLecturesChange.subscribe(() => {
      this.selectedLecturesLength =
        this._multiSelectService.selectedLectures.length;
    });

    this.route.url.subscribe(() => {
      this._multiSelectService.unchooseAll();
      this._multiSelectService.setSelectAllLectures([]);
    });
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

  get sortRequest() {
    return this._globalState.sortRequest;
  }
  set sortRequest(value: string) {
    this._globalState.sortRequest = value;
  }

  get searchRequest() {
    return this._globalState.searchRequest;
  }
  set searchRequest(value: string) {
    this._globalState.searchRequest = value;
  }

  isSortRequests(): boolean {
    return (
      !this.searchRequest.trim() &&
      this.sortRequest == "Default View" &&
      !this._filterService.getAllActiveFiltersCount()
    );
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      let searchString = params["search"];
      if (searchString) {
        this.search = searchString;
        this.searchText();
      }
    });

    this.form = new FormGroup({
      search: new FormControl({ value: "search", disabled: false }, [
        Validators.required,
      ]),
      sort: new FormControl({ value: "sort" }),
    });

    this.form.valueChanges.subscribe(data => {
      if (data && data?.sort && data.sort !== this.previousSortRequest) {
        this.previousSortRequest = data.sort;
        this.sortRequest = data.sort;
        this.searchText();
      }
    });
  }
  onSearchChange() {
    if (this.search.trim() !== "") return;
    this.textItems = [];
    this.showHowSearch = true;
  }

  toggleSelectMode() {
    this._multiSelectService.toggleSelectMode();
  }

  async showDialog() {
    await this.dialog.toPromise();
    this.searchText();
  }
  pushSearchParamsToURL() {
    let queryParams: Params = { search: this.searchString }; // Specify your search parameters here
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: "merge", // This will merge the new parameters with existing ones
    });
  }

  onScroll() {
    if (!this.isLoading && !this.isEmpty) {
      if (this.throttleTimer) {
        clearTimeout(this.throttleTimer);
      }
      this.throttleTimer = setTimeout(() => {
        const element = document.documentElement;
        if (element.scrollHeight - element.scrollTop === element.clientHeight) {
          this.loadMore();
        }
      }, 200);
    }
  }
  loadMore() {
    this.index++;
    if (this.isLoading || this.isEmpty) {
      return;
    }

    this.skip += 15;

    const filters = this._filterService.allActiveFilters;
    const sort = this.getSortObjectForRequest();

    this._deepSearchService
      .searchTranscriptions(
        this.searchString,
        filters,
        sort,
        this.skip,
        this.take
      )
      .subscribe(data => {
        if (!data) {
          return;
        }
        this.textItems.push(...data.data.transcriptions);
        this.isEmpty = data.total === 0;
        this.isLoading = false;
      });
  }
  searchText() {
    if (!this.search.trim()) {
      return;
    }

    this.textItems = [];
    this.isEmpty = false;
    this.searchError = "";
    this.isLoading = true;
    this.showHowSearch = false;
    this.searchString = this.search;

    this.pushSearchParamsToURL();

    const filters = this._filterService.allActiveFilters;
    const sort = this.getSortObjectForRequest();

    this._deepSearchService
      .searchTranscriptions(
        this.searchString,
        filters,
        sort,
        this.skip,
        this.take
      )
      .subscribe(
        data => {
          if (!data) {
            return;
          }
          this.textItems = data.data.transcriptions;
          this.isEmpty = data.total === 0;
          this.isLoading = false;
        },
        err => {
          this.isLoading = false;
          this.searchError = "HTTP Error";
          console.log("HTTP Error", err);
        }
      );
  }

  private getSortObjectForRequest() {
    let sort: LectureSortDto | undefined = undefined;
    switch (this.sortRequest) {
      case "Duration (low to high)": {
        sort = { duration: "asc" };
        break;
      }
      case "Duration (high to low)": {
        sort = { duration: "desc" };
        break;
      }
      case "Rec date (oldest first)": {
        sort = { dateOfRecording: "asc" };
        break;
      }
      case "Rec date (latest first)": {
        sort = { dateOfRecording: "desc" };
        break;
      }
      case "Alphabetically (A-Z)": {
        sort = { "title.keyword": "asc" };
        break;
      }
      case "Alphabetically (Z-A": {
        sort = { "title.keyword": "desc" };
        break;
      }
      default: {
        sort = undefined;
      }
    }
    return sort;
  }
}
