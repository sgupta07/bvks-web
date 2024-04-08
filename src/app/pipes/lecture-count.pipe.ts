import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "lectureCount",
})
export class LectureCountPipe implements PipeTransform {
  transform(count: number | undefined): string {
    if (!count) {
      return;
    }
    if (count === 1) {
      return "1 Mention";
    }

    return `${count} Mentions`;
  }
}
