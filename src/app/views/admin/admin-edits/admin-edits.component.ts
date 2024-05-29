import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { EditChangeRequestStatusEnum, IEdit } from "src/app/models/edits";
import { ILecture } from "src/app/models/lecture";
import { EditsService } from "src/app/services/edits.service";
import { GlobalStateService } from "src/app/services/global-state.service";
import { LecturesService } from "src/app/services/lectures.service";

@Component({
  selector: "app-admin-edits",
  templateUrl: "./admin-edits.component.html",
  styleUrls: ["./admin-edits.component.scss"],
})
export class AdminEditsComponent implements OnInit {
  subscriptions: any[] = [];
  showDropdown = false;
  filteredLectures: ILecture[] = [];
  lectures: ILecture[] = [];
  searchFieldText = `Enter title or ID`;
  search = "";
  readonly take = 30;
  selectedTab: "open" | "closed" = "open";
  tickets: IEdit[] = [];
  totalItems = 0;
  page = 1;
  status = EditChangeRequestStatusEnum.created;
  isLoading = false;

  constructor(
    private _editsService: EditsService,
    private router: Router,
    private _lecturesService: LecturesService,
    private _globalStateService: GlobalStateService,
    private toast: ToastrService
  ) {}

  async ngOnInit() {
    await this.requestEdits();
    const subscription = this._globalStateService.onLecturesLoaded.subscribe(
      () => {
        this.toast.success("Now you can search by title");
      }
    );
    this.subscriptions.push(subscription);
  }
  async ngOnDestroy() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  searchEdits(id: string) {
    this.router.navigate([`/admin/edits/`, id]);
  }
  onSearchEditChange(search: string | undefined) {
    this.search = search;
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

  onSearchFocusChange(isFocused: Event) {
    if (isFocused) {
      this.showDropdown = true;
    }
  }
  onDropdownLectureClick(id: number) {
    if (!id) return;

    this.searchEdits(String(id));
  }

  async requestEdits() {
    this.isLoading = true;
    try {
      const res = await this._editsService.getEdits({
        take: this.take,
        skip: (this.page - 1) * this.take,
        status: this.status,
      });
      this.totalItems = res.data.totalItems;
      this.tickets.push(...res.data.items);
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }
  }

  setSelectedTab(tab: "open" | "closed") {
    this.selectedTab = tab;

    if (tab === "open") {
      this.status = EditChangeRequestStatusEnum.created;
    } else {
      this.status = EditChangeRequestStatusEnum.approved;
    }

    this.page = 1;
    this.totalItems = 0;
    this.tickets = [];
    this.requestEdits();
  }

  loadMore() {
    if (this.tickets.length >= this.totalItems) {
      return;
    }

    this.page++;
    this.requestEdits();
  }
}
