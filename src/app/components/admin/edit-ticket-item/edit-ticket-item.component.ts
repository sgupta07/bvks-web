import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { EditChangeRequestStatusEnum, IEdit } from "src/app/models/edits";
import { StatisticService } from "src/app/services/statistic.service";

@Component({
  selector: "app-edit-ticket-item",
  templateUrl: "./edit-ticket-item.component.html",
  styleUrls: ["./edit-ticket-item.component.scss"],
})
export class EditTicketItemComponent implements OnInit {
  @Input() ticket: IEdit;
  EditStatusEnum = EditChangeRequestStatusEnum;
  title: string;

  constructor(
    private _statisticService: StatisticService,
    private _router: Router
  ) {}

  async ngOnInit() {
    try {
      const lectureData = await this._statisticService.getActuaLectureData(
        this.ticket.transcriptionId
      );
      this.title = lectureData.title.join(" ");
    } catch (error) {}
  }

  openTranscription() {
    if (this.ticket.status === EditChangeRequestStatusEnum.created) {
      this._router.navigate(["admin", "edits", this.ticket.transcriptionId]);
    } else {
      return;
    }
  }
}
