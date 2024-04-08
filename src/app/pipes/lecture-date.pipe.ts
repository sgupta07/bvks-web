import { Pipe, PipeTransform } from "@angular/core";
import { ILecture } from "../models/lecture";

@Pipe({
  name: "lectureDate",
})
export class LectureDatePipe implements PipeTransform {
  transform(value: ILecture["dateOfRecording"]): string {
    return `${value.day}/${value.month}/${value.year}`;
  }
}
