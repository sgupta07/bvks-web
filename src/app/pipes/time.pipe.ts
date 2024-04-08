import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "time",
})
export class TimePipe implements PipeTransform {
  transform(value: number, hideSeconds: boolean): string {
    const minutesInHour = 60,
      hoursInDay = 24,
      secondsInMinute = 60;

    const hours = this.checkNumberLength(
        Math.floor((value / secondsInMinute / minutesInHour) % hoursInDay) + ""
      ),
      minutes = this.checkNumberLength(
        Math.floor((value / secondsInMinute) % minutesInHour) + ""
      ),
      seconds = this.checkNumberLength(
        Math.floor(value % secondsInMinute) + ""
      );

    let transformedTime = `${hours}:${minutes}:${seconds}`;

    if (hideSeconds) {
      transformedTime = `${hours}:${minutes}`;
    }

    return transformedTime;
  }

  checkNumberLength(num: string): string {
    return num.length < 2 ? "0" + num : num;
  }
}
