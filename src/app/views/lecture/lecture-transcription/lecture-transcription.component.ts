import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { ILecture } from "src/app/models/lecture";
import { IUserLecture } from "src/app/models/user";
import { DeepSearchService } from "src/app/services/deep-search.service";
import { DownloadFileService } from "src/app/services/download-file.service";
import { DownloadsService } from "src/app/services/downloads.service";
import { EditsService } from "src/app/services/edits.service";
import { FavoritesService } from "src/app/services/favorites.service";
import { FilterService } from "src/app/services/filter.service";
import { LecturesProgressService } from "src/app/services/lectures-progress.service";
import { LecturesService } from "src/app/services/lectures.service";
import { ModalService } from "src/app/services/modal.service";
import { ShareService } from "src/app/services/share.service";
import { StatisticService } from "src/app/services/statistic.service";

@Component({
  selector: "app-lecture-transcription",
  templateUrl: "./lecture-transcription.component.html",
  styleUrls: ["./lecture-transcription.component.scss"],
})
export class LectureTranscriptionComponent implements OnInit {
  lectureId: number;
  lectureData: ILecture;
  lectureDataError = false;
  selectedLecturesLength = 1;
  form: FormGroup;
  title = "";
  transcription = "";
  showPopup = false;
  correctText: string = "";
  selectedText: string = "";
  tempSearch: string = "";
  selectedTextStartIndex: number = 0;
  selectedTextEndIndex: number = 0;
  isModalOpen: boolean = false;
  modalPosition: { top: number; left: number } = { top: 0, left: 0 };
  searchQuery = "";
  lectureProgressData: IUserLecture;
  isLectureFavorite = false;

  @ViewChild("modal") modalElement: ElementRef;

  constructor(
    private toaster: ToastrService,
    private fileDownloadService: DownloadFileService,
    public _statisticService: StatisticService,
    private _activatedRoute: ActivatedRoute,
    private _lecturesProgressService: LecturesProgressService,
    public _lecturesService: LecturesService,
    public _filterService: FilterService,
    private _favoritesService: FavoritesService,
    private _downloadService: DownloadsService,
    private _modalService: ModalService,
    private _shareService: ShareService,
    private _deepSearchService: DeepSearchService,
    private _editsService: EditsService
  ) {
    this._activatedRoute.queryParams.subscribe(params => {
      // Access individual query parameters
      this.searchQuery = params["search"] || "";
    });
  }

  async getActualLectureData() {
    const query = +this._activatedRoute.snapshot.params.id;
    this.lectureId = query;
    try {
      this.lectureData = await this._statisticService.getActuaLectureData(
        query
      );
      this.title = this.lectureData.title.join(" ");
      this.lectureProgressData =
        this._lecturesProgressService.getProgressByLectureId(
          this.lectureData.id
        );
      this.isLectureFavorite = this._favoritesService.isLectureInFavorites(
        this.lectureData.id
      );
      console.log(this.isLectureFavorite, this.lectureProgressData);
    } catch (error) {
      this.title = this.title || String(query);
      this.lectureDataError = true;
    }

    this._deepSearchService.searchTranscriptionById(query).subscribe(data => {
      if (!data) {
        return;
      }
      this.transcription = data.data.join(" ");
    });
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      correctText: new FormControl(""),
    });
    this.getActualLectureData();
  }

  openModal() {
    console.log("Opening modal");
    this.isModalOpen = true;
  }

  closeModal() {
    console.log("Closing modal");
    this.isModalOpen = false;
    this.selectedText = "";
  }

  onOverlayClick(event: MouseEvent) {
    console.log("Overlay click");
    const modal = document.querySelector(".selection-modal");
    if (modal && !modal.contains(event.target as Node)) {
      this.closeModal();
    }
  }

  // Function to handle selection
  handleSelection() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText) {
      // Workaround to fix the issue with multiple nodes in the selection
      this.tempSearch = JSON.parse(JSON.stringify(this.searchQuery));
      this.searchQuery = "";

      // Get the position of the selection
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Calculate modal position
      let modalTop = rect.top + window.scrollY - 90;
      let modalLeft = rect.left + window.scrollX;

      if (modalLeft < 200) {
        modalLeft += 100;
      } else if (modalLeft > 1000) {
        modalLeft -= 100;
      }
      // Adjust modal position to stay within the component boundaries
      const modalPosition = { top: modalTop, left: modalLeft };

      // Set the position of the modal
      this.modalPosition = modalPosition;
      this.adjustElementPosition();
      this.selectedText = selectedText;
      this.selectedTextStartIndex = Math.min(
        selection.anchorOffset,
        selection.focusOffset
      );
      this.selectedTextEndIndex = Math.max(
        selection.anchorOffset,
        selection.focusOffset
      );
      this.openModal();
    } else if (selection.toString().length === 0) {
      this.searchQuery = this.tempSearch;
      this.correctText = "";
      this.closeModal();
    }
  }

  onModalClick(event: MouseEvent) {
    // Stop the click event propagation within the modal
    event.stopPropagation();
  }

  adjustElementPosition() {
    // You can add logic here to restrict the element's position within the screen
    // For example, you can check screen dimensions and adjust the element's position accordingly
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Adjust left position
    if (this.modalPosition.left < 0) {
      this.modalPosition.left = 0;
    } else if (this.modalPosition.left + 100 > screenWidth) {
      this.modalPosition.left = screenWidth - 100;
    }

    // Adjust top position
    if (this.modalPosition.top < 0) {
      this.modalPosition.top = 0;
    } else if (this.modalPosition.top + 100 > screenHeight) {
      this.modalPosition.top = screenHeight - 100;
    }
  }

  async selectionSubmit() {
    if (
      !this.correctText ||
      this.correctText === this.selectedText ||
      this.correctText.trim().length === 0
    ) {
      this.toaster.error("Incorrect text format.");
      return;
    }

    try {
      await this._editsService.createEdit({
        transcriptionId: this.lectureId,
        oldText: this.selectedText,
        newText: this.correctText,
        startTextIndex: this.selectedTextStartIndex,
        endTextIndex: this.selectedTextEndIndex,
      });
      this.correctText = "";
      this.handleSelection();
      this.isModalOpen = false;
      this.toaster.success("Edit request sent!");
    } catch (error) {
      this.toaster.error("Error when suggest edit");
      console.log("Error: ", error);
    }
  }

  // lecture options
  addToPlaylist() {
    this._modalService.addToPlaylist([this.lectureData.id]);
  }

  async toggleFavorite() {
    this.isLectureFavorite = !this.isLectureFavorite;
    try {
      await this._favoritesService.toggleFavorites(this.lectureData.id);
    } catch (error) {
      this.isLectureFavorite = !this.isLectureFavorite;
    }
  }

  downloadLecture() {
    // this._downloadService.donwloadSingleLecture(this.lectureData);
    const filename = `${this.title}.txt`;
    const contentType = "text/plain";

    this.fileDownloadService.downloadFile(
      this.transcription,
      filename,
      contentType
    );
  }

  toggleComplete() {
    if (this.lectureProgressData.isCompleted) {
      this.lectureProgressData.isCompleted = false;
      this._lecturesProgressService.resetCompletion(this.lectureData.id);

      // refresh time stamp after reset complete option
      // this.sendLectureTimeStamp();
    } else {
      this.lectureProgressData.isCompleted = true;
      this._lecturesProgressService.markAsComplete(this.lectureData.id);
    }
  }
  shareLink() {
    this._shareService.copyLinkToClipboard(this.lectureData.id, 0, true);
  }
  resetSearch() {
    this.searchQuery = "";
  }
  searchText(searchStr: string) {
    this.searchQuery = searchStr;
  }
}
