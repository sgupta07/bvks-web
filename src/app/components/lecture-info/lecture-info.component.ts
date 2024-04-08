import { TuiDialogContext } from "@taiga-ui/core";
import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";
import { ILecture } from "src/app/models/lecture";
import { Component, OnInit, Inject } from "@angular/core";

@Component({
  selector: "app-lecture-info",
  templateUrl: "./lecture-info.component.html",
  styleUrls: ["./lecture-info.component.scss"],
})
export class LectureInfoComponent implements OnInit {
  data: ILecture;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean>
  ) {}

  ngOnInit(): void {
    this.data = this.context.data;
  }

  closeModal() {
    this.context.completeWith(false);
  }
}
