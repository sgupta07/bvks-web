import { FilterService } from "./filter.service";
import { PaginationService } from "./pagination.service";
import { EventEmitter } from "@angular/core";
import { LecturesService } from "./lectures.service";
import { ILecture } from "./../models/lecture";
import { Injectable } from "@angular/core";
import { FavoritesService } from "./favorites.service";
import { GlobalStateService } from "./global-state.service";

@Injectable({
  providedIn: "root",
})
export class MultiSelectService {
  selectedLectures: number[] = [];
  isSelectMode = false;
  isSelectAfterSearch = false;
  selectAllLectures: number[] = [];

  onSelectMode: EventEmitter<boolean> = new EventEmitter();
  onSelectedLecturesChange: EventEmitter<ILecture> = new EventEmitter();
  onSelectAfterSearch: EventEmitter<boolean> = new EventEmitter();

  get pageIndex() {
    return this._paginationService.pageIndex;
  }

  get getSelectedLectures() {
    return this.selectedLectures;
  }

  get activeFiltersCount(): number {
    return this._filterService.getAllActiveFiltersCount();
  }

  setSelectAllLectures(value: number[]) {
    this.selectAllLectures = value;
  }

  searchSelectTrigger(value: boolean) {
    this.isSelectAfterSearch = value;
    this.onSelectAfterSearch.emit(true);
  }

  constructor(
    private _paginationService: PaginationService,
    private _filterService: FilterService,
    private _globalState: GlobalStateService
  ) {}

  toggleSelectMode() {
    this.isSelectMode = !this.isSelectMode;
    this.onSelectMode.emit(null);
    if (!this.isSelectMode) {
      this.unchooseAll();
    }
  }

  toggleLectureSelect(id: number) {
    const isSelected = this.selectedLectures.includes(id);
    if (isSelected) {
      const deleteIdx = this.selectedLectures.findIndex(el => el === id);
      this.selectedLectures.splice(deleteIdx, 1);
    } else {
      this.selectedLectures.push(id);
    }
    this.onSelectedLecturesChange.emit(null);
  }

  chooseAll() {
    let selectingLectures: number[] = [];
    if (
      this.activeFiltersCount === 0 &&
      !this._globalState.searchRequest.length &&
      this._globalState.sortRequest === "Default View"
    ) {
      selectingLectures = this.selectAllLectures;
    } else {
      selectingLectures = this.selectAllLectures.slice(0, 20 * this.pageIndex);
    }
    this.selectedLectures = selectingLectures;

    this.onSelectedLecturesChange.emit(null);
  }

  unchooseAll() {
    this.selectedLectures = [];
    this.isSelectMode = false;
    this.onSelectedLecturesChange.emit(null);
    this.onSelectMode.emit(null);
  }

  getSelectedLecturesIds() {
    return this.selectedLectures;
  }
}
