import { FilterCategories } from "./../models/enums/FilterCategories";
import { EventEmitter, Injectable } from "@angular/core";

import { LecturesService } from "src/app/services/lectures.service";

import { ILecture } from "./../models/lecture";
import { IFilter } from "./../models/filter";

@Injectable({
  providedIn: "root",
})
export class FilterService {
  onFilterClear = new EventEmitter();

  showRequest: string;
  search: string = "";
  sortRequest: string;
  filters: IFilter;

  lecturesForSort: any;

  get allActiveFilters(): IFilter {
    return this.activeFilters;
  }

  get searchValue(): string {
    return this.search;
  }

  private activeFilters: IFilter = {
    language: [],
    country: [],
    place: [],
    year: [],
    month: [],
    category: [],
    translation: [],
  };

  private localActiveFilterVariants: IFilter = {
    language: [],
    country: [],
    place: [],
    year: [],
    month: [],
    category: [],
    translation: [],
  };

  constructor(private _lecturesService: LecturesService) {}

  toggleActiveFilter(type: FilterCategories, filter: string) {
    if (this.isVariantActive(type, filter)) {
      const index = this.localActiveFilterVariants[type].findIndex(
        (x) => x === filter
      );
      this.localActiveFilterVariants[type].splice(index, 1);

      return;
    }

    this.localActiveFilterVariants[type].push(filter);
  }

  isVariantActive(type: FilterCategories, filter: string): boolean {
    return this.localActiveFilterVariants[type].includes(filter);
  }

  transferLocalFiltersToGlobal() {
    this.activeFilters = {
      language: [...this.localActiveFilterVariants.language],
      country: [...this.localActiveFilterVariants.country],
      place: [...this.localActiveFilterVariants.place],
      year: [...this.localActiveFilterVariants.year],
      month: [...this.localActiveFilterVariants.month],
      category: [...this.localActiveFilterVariants.category],
      translation: [...this.localActiveFilterVariants.translation],
    };
  }

  getActiveFiltersCount(type: FilterCategories): number {
    return this.localActiveFilterVariants[type].length;
  }

  getAllActiveFiltersCount(): number {
    let count = 0;
    let key:
      | "language"
      | "country"
      | "place"
      | "year"
      | "month"
      | "category"
      | "translation";

    for (key in this.activeFilters) {
      count += this.activeFilters[key].length;
    }

    return count;
  }

  resetLocalActiveFilters() {
    this.localActiveFilterVariants = {
      language: [...this.activeFilters.language],
      country: [...this.activeFilters.country],
      place: [...this.activeFilters.place],
      year: [...this.activeFilters.year],
      month: [...this.activeFilters.month],
      category: [...this.activeFilters.category],
      translation: [...this.activeFilters.translation],
    };
  }

  clearActiveFilters() {
    this.onFilterClear.emit();

    let key:
      | "language"
      | "country"
      | "place"
      | "year"
      | "month"
      | "category"
      | "translation";

    for (key in this.localActiveFilterVariants) {
      this.localActiveFilterVariants[key] = [];
    }

    for (key in this.activeFilters) {
      this.activeFilters[key] = [];
    }
  }

  setFilters(filters: IFilter) {
    this.activeFilters = { ...filters };
  }

  getFilters(): IFilter {
    return this.activeFilters;
  }
}
