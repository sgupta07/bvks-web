import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { TuiDialogService } from "@taiga-ui/core";
import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";
import { FilterComponent } from "src/app/components/filter/filter.component";
import { DeepSearchService } from "src/app/services/deep-search.service";
import { FilterService } from "src/app/services/filter.service";
import { GlobalStateService } from "src/app/services/global-state.service";
import { HowSearchComponent } from "../how-search/how-search.component";
import { LecturesService } from "src/app/services/lectures.service";
import { MultiSelectService } from "src/app/services/multi-select.service";
import { SearchService } from "src/app/services/search.service";
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
  textItems: any[] = [];
  isLoading = false;
  isEmpty = false;
  showPopup = false;
  showHowSearch = true;
  constructor(
    public _lecturesService: LecturesService,
    public _filterService: FilterService,
    private _multiSelectService: MultiSelectService,
    private route: ActivatedRoute,
    private _searchService: SearchService,
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
      show: new FormControl(null),
      sort: new FormControl(null),
      filter: new FormControl(null),
      period: new FormControl(null),
    });

    this.form = new FormGroup({
      search: new FormControl({ value: "search", disabled: false }, [
        Validators.required,
      ]),
    });
  }
  onSearchChange() {
    if (this.search.trim() !== "") return;
    this.textItems = [];
    this.showHowSearch = true;
  }
  set sortRequest(value: string) {
    this._globalState.sortRequest = value;
  }

  toggleSelectMode() {
    this._multiSelectService.toggleSelectMode();
  }

  async showDialog() {
    await this.dialog.toPromise();
  }
  pushSearchParamsToURL() {
    let queryParams: Params = { search: this.searchString }; // Specify your search parameters here
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: "merge", // This will merge the new parameters with existing ones
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
    this._deepSearchService.searchTranscriptions(this.searchString)?.subscribe(
      data => {
        if (!data) {
          return;
        }
        this.textItems = data.data;
        this.isEmpty = data.data.length === 0;
        this.isLoading = false;
      },
      err => {
        this.isLoading = false;
        this.searchError = "HTTP Error";
        console.log("HTTP Error", err);
      }
    );
  }
}
