import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { EditChangeRequestStatusEnum, IEdit } from "src/app/models/edits";
import { DeepSearchService } from "src/app/services/deep-search.service";
import { EditsService } from "src/app/services/edits.service";
import { StatisticService } from "src/app/services/statistic.service";

@Component({
  selector: "app-admin-edit-page",
  templateUrl: "./admin-edit-page.component.html",
  styleUrls: ["./admin-edit-page.component.scss"],
})
export class AdminEditPageComponent implements OnInit {
  loadTextError = "";
  lectureId: number;
  title = "";
  info: { head: string; text: string }[] = [];
  transcript = "";
  edits: IEdit[] = [];
  selectedEdit: IEdit;
  editPage = 0;
  private readonly EDITS_PER_PAGE = 10;
  totalEditPages = 0;
  popoverPosition = { top: 0, left: 0 };

  @ViewChild("transcriptEl") transcriptEl: ElementRef;
  @ViewChild("transcriptBody") transcriptBody: ElementRef;
  @ViewChild("popoverEl") popoverEl: ElementRef;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _editsService: EditsService,
    private _deepSearchService: DeepSearchService,
    private _statisticService: StatisticService,
    private _renderer: Renderer2,
    private _router: Router
  ) {
    this.lectureId = +this._activatedRoute.snapshot.params.id;
  }

  async ngOnInit() {
    await this.loadText();
    await this.loadEdits();
    this.distributeHighlights();

    const lectureData = await this._statisticService.getActuaLectureData(
      this.lectureId
    );
    this.title = lectureData.title.join(" ");
    this.info = [
      { head: "Category", text: lectureData.category.join(", ") },
      { head: "Language", text: lectureData.language.main },
      { head: "Lecture code", text: lectureData.id.toString() },
      { head: "Country", text: lectureData.location.country || "-" },
      { head: "Place", text: lectureData.place?.join(", ") || "-" },
      { head: "Tags", text: lectureData.tags?.join(", ") || "-" },
    ];
  }

  async loadEdits() {
    try {
      const editsResponse = await this._editsService.getTranscriptionById(
        this.lectureId.toString(),
        {
          skip: this.editPage * this.EDITS_PER_PAGE,
          take: this.EDITS_PER_PAGE,
        }
      );
      const onlyCreatedEdits = editsResponse.data.items.filter(
        edit => edit.status === EditChangeRequestStatusEnum.created
      );
      const sortedByStartIndex = onlyCreatedEdits.sort(
        (a, b) => a.startTextIndex - b.startTextIndex
      );
      this.edits = sortedByStartIndex;
      this.selectedEdit = sortedByStartIndex[0];
      this.totalEditPages = Math.ceil(
        editsResponse.data.totalItems / this.EDITS_PER_PAGE
      );
    } catch (error) {
      console.log("error", error);
    }
  }

  async loadText() {
    const res = await this._deepSearchService
      .searchTranscriptionById(this.lectureId)
      .toPromise()
      .catch(err => {
        this.loadTextError = err.error.error;
        console.log("error", err);
      });
    if (!res.data) {
      return;
    }
    this.transcript = res.data[0];
  }

  onPageChange(page: number) {
    this.editPage = page;
  }

  selectEdit(event: IEdit) {
    this.selectedEdit = event;
    this.distributeHighlights();
  }

  distributeHighlights() {
    if(!this.selectedEdit) return
    const textCopy = this.transcript.slice();
    const newText =
      textCopy.slice(0, this.selectedEdit?.startTextIndex) +
      `<span id="edit-${this.selectedEdit?.id}" class="highlight">${this.selectedEdit?.oldText}</span>` +
      textCopy.slice(
        this.selectedEdit?.startTextIndex + this.selectedEdit?.oldText?.length
      );

    this._renderer.setProperty(
      this.transcriptEl.nativeElement,
      "innerHTML",
      newText
    );

    this.locatePopover();
  }

  locatePopover() {
    const highlightEl = this.transcriptEl.nativeElement.querySelector(
      `#edit-${this.selectedEdit?.id}`
    );
    const highlightCoords: DOMRect = highlightEl.getBoundingClientRect();
    const transcriptCoords: DOMRect =
      this.transcriptEl.nativeElement.getBoundingClientRect();
    const popoverCoords: DOMRect =
      this.popoverEl.nativeElement.getBoundingClientRect();

    let yOffset = 30;
    const distanceToTop = highlightCoords.top - transcriptCoords.top;
    if (distanceToTop < popoverCoords.height + 30) {
      yOffset = distanceToTop + 30;
    } else {
      yOffset = distanceToTop - 110;
    }

    let xOffset = 0;
    const distanceToLeft = highlightCoords.left - transcriptCoords.left;
    if (
      distanceToLeft < popoverCoords.width / 2 &&
      highlightCoords.width < popoverCoords.width
    ) {
      // if the highlight is too close to the LEFT edge
      xOffset = 0;
    } else if (transcriptCoords.width - distanceToLeft < popoverCoords.width) {
      // if the highlight is too close to the RIGHT edge
      xOffset = transcriptCoords.width - popoverCoords.width;
    } else {
      // in the middle of the highlight
      xOffset =
        distanceToLeft - popoverCoords.width / 2 + highlightCoords.width / 2;
    }

    this.popoverPosition = {
      top: yOffset,
      left: xOffset,
    };
    highlightEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  acceptEdit() {
    this.processEdit("approve");
  }

  rejectEdit() {
    this.processEdit("reject");
  }

  private async processEdit(action: "approve" | "reject") {
    try {
      if (action === "approve") {
        await this._editsService.approveEdit(this.selectedEdit.id.toString());
      } else if (action === "reject") {
        await this._editsService.rejectEdit(this.selectedEdit.id.toString());
      }
      await this.loadText();
      await this.loadEdits();

      if (this.edits.length > 0) {
        this.selectEdit(this.edits[0]);
      } else {
        this._router.navigateByUrl("/admin/edits");
      }
    } catch (error) {
      console.log(error);
    }
  }
}
