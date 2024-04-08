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
    languages: [],
    countries: [],
    place: [],
    years: [],
    month: [],
    categories: [],
    translation: [],
  };

  private localActiveFilterVariants: IFilter = {
    languages: [],
    countries: [],
    place: [],
    years: [],
    month: [],
    categories: [],
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
      languages: [...this.localActiveFilterVariants.languages],
      countries: [...this.localActiveFilterVariants.countries],
      place: [...this.localActiveFilterVariants.place],
      years: [...this.localActiveFilterVariants.years],
      month: [...this.localActiveFilterVariants.month],
      categories: [...this.localActiveFilterVariants.categories],
      translation: [...this.localActiveFilterVariants.translation],
    };
  }

  getActiveFiltersCount(type: FilterCategories): number {
    return this.localActiveFilterVariants[type].length;
  }

  getAllActiveFiltersCount(): number {
    let count = 0;
    let key:
      | "languages"
      | "countries"
      | "place"
      | "years"
      | "month"
      | "categories"
      | "translation";

    for (key in this.activeFilters) {
      count += this.activeFilters[key].length;
    }

    return count;
  }

  resetLocalActiveFilters() {
    this.localActiveFilterVariants = {
      languages: [...this.activeFilters.languages],
      countries: [...this.activeFilters.countries],
      place: [...this.activeFilters.place],
      years: [...this.activeFilters.years],
      month: [...this.activeFilters.month],
      categories: [...this.activeFilters.categories],
      translation: [...this.activeFilters.translation],
    };
  }

  clearActiveFilters() {
    this.onFilterClear.emit();

    let key:
      | "languages"
      | "countries"
      | "place"
      | "years"
      | "month"
      | "categories"
      | "translation";

    for (key in this.localActiveFilterVariants) {
      this.localActiveFilterVariants[key] = [];
    }

    for (key in this.activeFilters) {
      this.activeFilters[key] = [];
    }
  }
}
