import { ILecture } from "./../models/lecture";
import { SearchService } from "./search.service";
import { Injectable } from "@angular/core";

import { LecturesService } from "./lectures.service";

@Injectable({
  providedIn: "root",
})
export class PaginationService {
  pageIndex = 1;
  paginatedLectures: ILecture[];

  constructor(private _lecturesService: LecturesService) {}

  get pageIndexValue() {
    return this.pageIndex;
  }

  getMoreLectures() {
    const from = 0;

    this._lecturesService.setLectures(this.paginatedLectures);

    const filtredLectures = this._lecturesService.lectures.slice(
      from,
      20 * this.pageIndex
    );

    this._lecturesService.setLectures(filtredLectures);
  }

  paginateAll(lectures: ILecture[]) {
    this.paginatedLectures = lectures;
    const limitedLectures = lectures.slice(0, 20);

    this._lecturesService.setLectures(limitedLectures);
  }

  setLecturesLimit(pageIndex: number) {
    this.pageIndex = pageIndex;
  }
}
