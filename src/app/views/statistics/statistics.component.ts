import { Component, OnInit, ViewChild } from "@angular/core";
import {
  IListenInfo,
  IPeriodStat,
  CategoryAbbr,
} from "src/app/models/statistics";
import { GlobalStateService } from "src/app/services/global-state.service";
import { LecturesService } from "src/app/services/lectures.service";
import { StatisticService } from "src/app/services/statistic.service";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

@Component({
  selector: "app-statistics",
  templateUrl: "./statistics.component.html",
  styleUrls: ["./statistics.component.scss"],
})
export class StatisticsComponent implements OnInit {
  totalAudio: number;
  totalListened: number;
  thisWeek: IPeriodStat;
  lastWeek: IPeriodStat;
  lastMonth: IPeriodStat;
  allTime: IPeriodStat;
  listenInfo: IListenInfo[];
  isLecturesInfoLoaded = false;

  constructor(
    private _lecturesService: LecturesService,
    private _globalState: GlobalStateService,
    private _statisticsService: StatisticService
  ) {
    this._globalState.onLecturesLoaded.subscribe(() => {
      this.initStats();
    });
  }

  ngOnInit() {
    this.initStats();
  }

  async initStats() {
    this.totalAudio = this._lecturesService.getTotalAudios();
    this.totalListened = await this._statisticsService.requestTotalListened();
    this.listenInfo = await this._statisticsService.getListenInfo();
    console.log("listenInfo", this.listenInfo);

    this.thisWeek = this._statisticsService.getThisWeekListened(
      this.listenInfo
    );
    this.lastMonth = this._statisticsService.getLastMonthListened(
      this.listenInfo
    );
    this.lastWeek = this._statisticsService.getLastWeekListened(
      this.listenInfo
    );
    this.allTime = this._statisticsService.getAllTimeListened(this.listenInfo);
    this.isLecturesInfoLoaded = true;
  }

  shareResults() {
    const data = document.getElementById("stats");
    this.generatePDF(data);
  }

  private generatePDF(htmlContent: any) {
    html2canvas(htmlContent).then(canvas => {
      let imgWidth = 350;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;
      const contentDataURL = canvas.toDataURL("image/png");
      let pdf = new jsPDF("l", "mm", "a4");
      var position = 20;
      pdf.addImage(contentDataURL, "PNG", 0, position, imgWidth, imgHeight);
      pdf.save("Statistics.pdf");
    });
  }
}
