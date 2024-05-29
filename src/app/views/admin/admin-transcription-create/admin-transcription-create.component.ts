import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { ILecture } from "src/app/models/lecture";
import { AdminTranscriptionService } from "src/app/services/admin-transcription.service";
import { GlobalStateService } from "src/app/services/global-state.service";
import { LecturesService } from "src/app/services/lectures.service";
import { StatisticService } from "src/app/services/statistic.service";

@Component({
  selector: "app-admin-transcription-create",
  templateUrl: "./admin-transcription-create.component.html",
  styleUrls: ["./admin-transcription-create.component.scss"],
})
export class AdminTranscriptionCreateComponent implements OnInit {
  showDropdown: boolean = false;
  form: FormGroup;
  transcription: string;
  currentTranscriptionId: number;
  searchError = "";
  searchFieldText = "Search transcription by id or title";
  filteredLectures: ILecture[] = [];
  isDisabledSearch = true;
  lectures: ILecture[] = [];
  isCreateMode = false;
  title: string = ''
  constructor(
    private _transcriptionService: AdminTranscriptionService,
    private toastr: ToastrService,
    private _lecturesService: LecturesService,
    private _globalStateService: GlobalStateService,
    private _statisticService: StatisticService,
  ) {
    this.form = new FormGroup({
      search: new FormControl(""),
    });
    this._globalStateService.onLecturesLoaded.subscribe(() => {
      this.isDisabledSearch = false;
    });
  }
  ngOnInit(): void {
    this.form.reset();
    this.transcription = "";
  }
  ngOnDestroy(): void {
    this.form.reset();
    this.transcription = "";
  }
  onSearchFocusChange(isFocused: Event) {
    if (isFocused) {
      this.showDropdown = true;
    }
  }
  async onDropdownLectureClick(id: number) {
    if (!id) {
      this.searchError = "Enter a valid id of transcription";
      return;
    }
    this.currentTranscriptionId = id;
    const lectureData = await this._statisticService.getActuaLectureData(id);
    this.title = lectureData.title.join(" ");
    this.transcription = '';
    this._transcriptionService.searchTranscriptionById(id).subscribe(
      data => {
        if (!data) {
          return;
        }
        this.transcription = data.data.join(" ");
      },
      error => {
        this.searchError = `Transcription for '${this.title}' not found`
        this.isCreateMode = error.error.status === 404;
      }
    );
    this.showDropdown = false;
  }
  onSearch() {
    const searchStr = this.form.get("search").value;

    this.transcription = "";
    const id = Number(searchStr.trim());
    if (!id) {
      this.searchError = "Enter a valid id of transcription";
      return;
    }
    this.currentTranscriptionId = id;
    this._transcriptionService.searchTranscriptionById(id).subscribe(
      data => {
        if (!data) {
          return;
        }
        this.transcription = data.data.join(" ");
      },
      error => {
        this.searchError = error.error.error;
        this.isCreateMode = error.error.status === 404;
      }
    );
  }

  onSearchLecturesChange(search: string) {
    this.showDropdown = true;
    if (!search) {
      this.showDropdown = false;
      return;
    }
    const lectures = this._lecturesService.getAllLectures();
    this.lectures = lectures;
    this.filteredLectures = this.lectures.filter(lecture => {
      return lecture.title.join(" ").toLowerCase().match(search.toLowerCase());
    });
  }

  onSearchTranscriptionChange() {
    this.searchError = "";
    const searchStr = this.form.get("search").value;
    this.onSearchLecturesChange(searchStr);
  }

  changeTranscription(id: number) {
    this._transcriptionService
      .changeTranscription({
        transcriptionId: id,
        transcriptions: [this.transcription],
      })
      .subscribe(
        () => {
          this.toastr.success(
            `Transcription with id: ${id} Successfully changed!`
          );
        },
        error => {
          this.toastr.success(
            error.error.error || "Error when change transcription."
          );
        }
      );
  }
  createTranscription(id: number) {
    this._transcriptionService
      .createTranscription({
        transcriptionId: id,
        transcriptions: [this.transcription],
      })
      .subscribe(
        () => {
          this.toastr.success(
            `Transcription with id: ${id} Successfully created!`
          );
        },
        error => {
          this.toastr.success(
            error.error.error || "Error when create transcription."
          );
        }
      );
  }

  onTranscriptionChange(text: string) {
    this.transcription = text;
  }
}
