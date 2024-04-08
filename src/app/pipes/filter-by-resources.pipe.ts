import { Pipe, PipeTransform } from "@angular/core";

import { ILecture } from "./../models/lecture";

@Pipe({
  name: "filterByResources",
})
export class FilterByResourcesPipe implements PipeTransform {
  transform(lectures: any = [], sortType: "All lectures" | "Videos Only"): any {
    if (sortType === "Videos Only") {
      lectures = lectures.filter((lecture: ILecture) => {
        return lecture.resources.videos.length;
      });
    }

    return lectures;
  }
}
