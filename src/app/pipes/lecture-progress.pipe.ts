import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "lectureProgress",
})
export class LectureProgressPipe implements PipeTransform {
  transform(value: number): string {
    if (value === 100) {
      return "✔";
    }

    return Math.floor(value) + "%";
  }
}
