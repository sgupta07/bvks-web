import { IPeriodStat, CategoryAbbr } from "./../../models/statistics";
import { FormGroup, FormControl } from "@angular/forms";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from "@angular/core";
import { TuiDay, TuiDayRange } from "@taiga-ui/cdk";
import { IListenInfo, StatisticsPeriods } from "src/app/models/statistics";
import { StatisticService } from "src/app/services/statistic.service";

@Component({
  selector: "app-statistics-period",
  templateUrl: "./statistics-period.component.html",
  styleUrls: ["./statistics-period.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsPeriodComponent implements OnInit {
  @Input() title: string;
  @Input() InfoListened: IPeriodStat;

  constructor() {}

  ngOnInit() {}
}
