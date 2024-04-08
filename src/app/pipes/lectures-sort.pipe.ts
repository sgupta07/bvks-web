import { PaginationService } from "./../services/pagination.service";
import { Pipe, PipeTransform } from "@angular/core";

import { ILecture } from "./../models/lecture";

@Pipe({
  name: "lecturesSort",
  pure: false,
})
export class LecturesSortPipe implements PipeTransform {
  constructor(private _paginationService: PaginationService) {}

  transform(
    lectures: ILecture[] = [],
    sortType:
      | ""
      | "Default View"
      | "Duration (low to high)"
      | "Duration (high to low)"
      | "Rec date (oldest)"
      | "Rec date (latest)"
      | "Alphabetically (A-Z)"
      | "Alphabetically (Z-A)"
  ): ILecture[] {
    switch (sortType) {
      case "Default View":
      case "":
        return lectures;
      case undefined:
        return lectures;
      case "Duration (low to high)":
        return lectures?.sort((a: any, b: any) => {
          return +a?.length - +b?.length;
        });
      case "Duration (high to low)":
        return lectures?.sort((a: any, b: any) => {
          return +b?.length - +a?.length;
        });
      case "Rec date (oldest)":
        return lectures?.sort((a: any, b: any) => {
          return (
            new Date(
              +a?.dateOfRecording.year,
              +a?.dateOfRecording.month - 1,
              +a?.dateOfRecording.day
            ).getTime() -
            new Date(
              +b?.dateOfRecording.year,
              +b?.dateOfRecording.month - 1,
              +b?.dateOfRecording.day
            ).getTime()
          );
        });
      case "Rec date (latest)":
        return lectures?.sort((a: any, b: any) => {
          return (
            new Date(
              +b?.dateOfRecording.year,
              +b?.dateOfRecording.month - 1,
              +b?.dateOfRecording.day
            ).getTime() -
            new Date(
              +a?.dateOfRecording.year,
              +a?.dateOfRecording.month - 1,
              +a?.dateOfRecording.day
            ).getTime()
          );
        });
      case "Alphabetically (A-Z)":
        return lectures?.sort((a, b) => {
          if (a?.title > b?.title) {
            return 1;
          } else if (a?.title < b?.title) {
            return -1;
          } else {
            return 0;
          }
        });
      case "Alphabetically (Z-A)":
        return lectures?.sort((a, b) => {
          if (b?.title > a?.title) {
            return 1;
          } else if (b?.title < a?.title) {
            return -1;
          } else {
            return 0;
          }
        });
    }
  }
}
