import { MultiSelectService } from "./multi-select.service";
import { Injectable } from "@angular/core";

import { ILecture } from "./../models/lecture";

@Injectable({
  providedIn: "root",
})
export class SearchService {
  timeOut: any;

  private lecturesForSearch: ILecture[];
  private searchedLectures: ILecture[];

  get allSearchedLectures(): ILecture[] {
    return this.searchedLectures;
  }

  constructor(private _multiselectService: MultiSelectService) {}

  async searchLectures(request: string): Promise<ILecture[]> {
    if (request.trim()) {
      this.searchedLectures = this.lecturesForSearch.filter(
        (lecture: ILecture) => {
          return (
            lecture.title
              .join(" ")
              .toLowerCase()
              .trim()
              .includes(request.toLowerCase().trim()) ||
            lecture.search.advanced.join(" ").includes(request)
          );
        }
      );

      return this.searchedLectures;
    }
  }
}
