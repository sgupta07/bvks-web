import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { PlaylistsService } from "src/app/services/playlists.service";
import { IUser } from "./../../models/user";
import { LecturesService } from "./../../services/lectures.service";
import { ModalService } from "./../../services/modal.service";
import { MultiSelectService } from "./../../services/multi-select.service";
import { ShareService } from "./../../services/share.service";
import { LectureInfoComponent } from "./../lecture-info/lecture-info.component";

import { TuiDialogService, TuiNotificationsService } from "@taiga-ui/core";
import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";
import { Subscription } from "rxjs";
import { AuthorizationService } from "src/app/services/authorization.service";
import { DownloadsService } from "src/app/services/downloads.service";
import { LecturesProgressService } from "src/app/services/lectures-progress.service";
import { environment } from "./../../../environments/environment";
import { ILecture } from "./../../models/lecture";
import { FavoritesService } from "./../../services/favorites.service";

@Component({
  selector: "app-lecture-post",
  templateUrl: "./lecture-post.component.html",
  styleUrls: ["./lecture-post.component.scss"],
  host: {
    "(document:click)": "onDropdownClick($event)",
  },
})
export class LecturePostComponent implements OnInit, OnDestroy {
  @Output() onLectureClick = new EventEmitter<null>();

  @Input() lectureData: ILecture;
  @Input() isFromMyPlaylist: boolean;
  @Input() playlistID: string;
  @Input() count: number | undefined;

  @ViewChild("button") button: ElementRef;
  user: IUser;
  isLecturePopupActive = false;
  showSkeleton = true;
  selectedLectures: number[] = [];
  moreInfoDialog: any;
  isSelectMode = false;
  isLectureSelected: boolean;
  downloadProgress: number = 0;
  isDropdownActive = false;

  selectModeSubscr: Subscription;
  selectedLecturesSubscr: Subscription;

  get lectureTitle(): string {
    return this.lectureData.title?.join(" ");
  }

  public get progress(): number {
    return this._progressService.getProgressInPercents(this.lectureData.id);
  }

  constructor(
    public _lecturesService: LecturesService,
    private _multiSelectService: MultiSelectService,
    private _notificationService: TuiNotificationsService,
    private _progressService: LecturesProgressService,
    private _shareService: ShareService,
    private _favoritesService: FavoritesService,
    private _downloadService: DownloadsService,
    private readonly dialogService: TuiDialogService,
    private _authService: AuthorizationService,
    private _modalService: ModalService,
    private _playlistsService: PlaylistsService
  ) {}

  async ngOnInit() {
    this.selectModeSubscr = this._multiSelectService.onSelectMode.subscribe(
      () => {
        this.isSelectMode = this._multiSelectService.isSelectMode;
        this.isLectureSelected = this.isSelected();
      }
    );
    this.selectedLecturesSubscr =
      this._multiSelectService.onSelectedLecturesChange.subscribe(() => {
        this.selectedLectures = this._multiSelectService.selectedLectures;
        this.isLectureSelected = this.isSelected();
      });
    this.user = this._authService.getUser();
    this.moreInfoDialog = this.dialogService.open<number>(
      new PolymorpheusComponent(LectureInfoComponent),
      {
        data: this.lectureData,
        dismissible: true,
        label: "Lecture info",
        size: "s",
        closeable: false,
      }
    );
  }

  ngOnDestroy(): void {
    this.selectModeSubscr.unsubscribe();
    this.selectedLecturesSubscr.unsubscribe();
  }

  checkLectureImage(): string {
    return this.lectureData.thumbnail
      ? this.lectureData.thumbnail
      : environment.lectionThumbnailPlaceholder;
  }

  hideSkeleton() {
    this.showSkeleton = false;
  }

  onDropdownClick(event: any) {
    if (
      this.button.nativeElement &&
      !this.button.nativeElement.contains(event.target)
    ) {
      this.isDropdownActive = false;
    }
  }

  playLecture() {
    if (!this.isSelectMode) {
    } else {
      this._multiSelectService.toggleLectureSelect(this.lectureData.id);
    }
  }

  interrractWithLecture() {
    this.onLectureClick.emit();
  }

  toggleDropdown() {
    this.isDropdownActive = !this.isDropdownActive;
  }

  async downloadLecture() {
    await this._downloadService.donwloadSingleLecture(this.lectureData);

    this._downloadService.onDownloadProgress.subscribe((event: number) => {
      this.downloadProgress = event;
    });

    this.toggleDropdown();
  }

  isSelected() {
    return this.selectedLectures.includes(this.lectureData.id);
  }

  toggleFavorites() {
    this._favoritesService.toggleFavorites(this.lectureData.id);
    this.toggleDropdown();
  }

  isLectureInFavorites(): boolean {
    return this._favoritesService.isLectureInFavorites(this.lectureData.id);
  }
  markAsComplete() {
    this._progressService.markAsComplete(this.lectureData.id);
  }
  resetCompletion() {
    this._progressService.resetCompletion(this.lectureData.id);
  }
  addToPlaylist() {
    this._modalService.addToPlaylist([this.lectureData.id]);
  }

  shareLink(lectureId: number, progress: number, lectureHasVideo: boolean) {
    this._shareService.copyLinkToClipboard(
      lectureId,
      progress,
      lectureHasVideo
    );
  }

  async openMoreInfoDialog() {
    await this.moreInfoDialog.toPromise();
  }
  removeFromPlaylist() {
    this._playlistsService.removeLectureFromPlaylist(
      this.lectureData.id,
      this.playlistID
    );
  }
}
