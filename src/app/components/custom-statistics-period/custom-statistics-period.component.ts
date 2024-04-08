import { IListenInfo } from "./../../models/statistics";
import { FormGroup, FormControl } from "@angular/forms";
import { Component, Input, OnInit } from "@angular/core";
import { TuiDay, TuiDayRange } from "@taiga-ui/cdk";
import { IPeriodStat } from "src/app/models/statistics";
import { StatisticService } from "src/app/services/statistic.service";
import { GlobalStateService } from "src/app/services/global-state.service";

@Component({
  selector: "app-custom-statistics-period",
  templateUrl: "./custom-statistics-period.component.html",
  styleUrls: ["./custom-statistics-period.component.scss"],
})
export class CustomStatisticsPeriodComponent implements OnInit {
  @Input() InfoListened: IPeriodStat;
  @Input() listenInfo: IListenInfo[];
  allTime = false;
  constructor(private _statisticsService: StatisticService) {}

  ngOnInit(): void {}

  readonly dateForm = new FormGroup({
    dateValue: new FormControl(
      new TuiDayRange(
        new TuiDay(2021, 1, 1),
        new TuiDay(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate()
        )
      )
    ),
  });

  readonly min = new TuiDay(2000, 2, 20);

  readonly max = new TuiDay(2040, 2, 20);

  onChange(value: boolean) {
    this.allTime = value;
    if (value) {
      this.InfoListened = this._statisticsService.calculateStatistic(
        this.listenInfo
      );
    }
  }

  onFocusedChange(event: any) {
    if (!event) {
      this.InfoListened = this._statisticsService.getCustomListened(
        this.dateForm.value.dateValue.from,
        this.dateForm.value.dateValue.to,
        this.listenInfo
      );
    }
  }
}
