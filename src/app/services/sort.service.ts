import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SortService {
  sortRequest: string;

  constructor() {}

  sortLectures(lectures: any, sortRequest: string) {
    switch (sortRequest) {
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
            +Date.parse(a?.creationTimestamp) -
            +Date.parse(b?.creationTimestamp)
          );
        });
      case "Rec date (latest)":
        return lectures?.sort((a: any, b: any) => {
          return (
            +Date.parse(b?.creationTimestamp) -
            +Date.parse(a?.creationTimestamp)
          );
        });
      case "Alphabetically (A-Z)":
        return lectures?.sort((a: any, b: any) => {
          if (a?.title > b?.title) {
            return 1;
          } else if (a?.title < b?.title) {
            return -1;
          } else {
            return 0;
          }
        });
      case "Alphabetically (Z-A)":
        return lectures?.sort((a: any, b: any) => {
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
