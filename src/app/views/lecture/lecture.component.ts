import { ShareService } from "./../../services/share.service";
import { filter, pairwise } from "rxjs/operators";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ILecture, IRepeatTypes } from "src/app/models/lecture";
import { AuthorizationService } from "src/app/services/authorization.service";
import { LecturesProgressService } from "src/app/services/lectures-progress.service";
import { DownloadsService } from "src/app/services/downloads.service";
import { FavoritesService } from "src/app/services/favorites.service";
import { LecturesService } from "src/app/services/lectures.service";
import { generateMultiPlaylist } from "./../../utils/player-helpers";
import { IPlayerSource, IPlayerQueryParams } from "src/app/models/player";
import { GlobalStateService } from "src/app/services/global-state.service";
import { Location } from "@angular/common";
import { PlaylistsService } from "src/app/services/playlists.service";
import { Subscription } from "rxjs";
import { AudioplayerService } from "src/app/services/audioplayer.service";
import { StatisticService } from "src/app/services/statistic.service";
import { DashboardService } from "src/app/services/dashboard.service";

@Component({
  selector: "app-lecture",
  templateUrl: "./lecture.component.html",
  styleUrls: ["./lecture.component.scss"],
})
export class LectureComponent implements OnInit, OnDestroy {
  lectureData: ILecture;
  source: IPlayerSource[];
  startPosition = 0;
  startTime: number;
  contentType: "Audio" | "Video";
  isCompleted: boolean = false;

  previousUrl: string;

  isFavorite: boolean;
  id: number;
  queryParams: IPlayerQueryParams;

  repeatType: IRepeatTypes = 0;

  subscriptions: Subscription[] = [];

  public get place(): string {
    if (!this.lectureData) {
      return;
    }

    let place = this.lectureData.place[0];

    if (this.lectureData.location.country) {
      place += ", " + this.lectureData.location.country;
    }
    if (this.lectureData.location.state) {
      place += ", " + this.lectureData.location.state;
    }
    if (this.lectureData.location.city) {
      place += ", " + this.lectureData.location.city;
    }

    return place;
  }

  constructor(
    private _lecturesService: LecturesService,
    private _router: Router,
    private _authService: AuthorizationService,
    private _activatedRoute: ActivatedRoute,
    private _progressService: LecturesProgressService,
    private _favService: FavoritesService,
    private _downloadService: DownloadsService,
    private _shareService: ShareService,
    private _statisticsService: StatisticService,
    private _globalStateService: GlobalStateService,
    private _location: Location,
    private _playlistsService: PlaylistsService,
    private _audioplayerService: AudioplayerService,
    private _dashboardService: DashboardService
  ) {
    const queryParams = this._activatedRoute.snapshot.queryParams;

    if (queryParams?.start_point) {
      this.startTime = queryParams?.start_point;
    }
  }

  async ngOnInit() {
    this.id = +this._activatedRoute.snapshot.params.id;
    this._audioplayerService.closePlayer();
    this._dashboardService.toggleSidebar(false);
    this.id = +this._activatedRoute.snapshot.params.id;
    this.queryParams = this._activatedRoute.snapshot
      .queryParams as IPlayerQueryParams;

    if ("start_point" in this.queryParams) {
      this.startTime = this.queryParams.start_point;
    }

    if (await this._authService.isUserLogged()) {
      this.init();
    }
    this._authService.onSignIn.subscribe(async () => {
      this.init();
    });
  }

  shareLink() {
    const actualProgress = +this._progressService.getProgressByLectureId(
      this.lectureData.id
    ).lastPlayedPoint;

    this._shareService.copyLinkToClipboard(
      this.lectureData.id,
      actualProgress,
      true
    );
  }

  ngOnDestroy() {
    for (const subscribtion of this.subscriptions) {
      subscribtion.unsubscribe();
    }
  }

  async init() {
    this.detectPlayListType(this.queryParams);
  }

  setFunctionsBarState() {
    this.isCompleted = this._progressService.getProgressByLectureId(
      this.lectureData.id
    ).isCompleted;
    this.isFavorite = this._favService.isLectureInFavorites(
      this.lectureData.id
    );
  }

  detectPlayListType(params: IPlayerQueryParams) {
    switch (params.videoListType) {
      case "categories":
        this.constructQueryByCategorie(params.videoListParams);
        break;
      case "playlist":
        this.constructQueryByPlaylist(params.videoListParams);
        break;
      case "favorites":
        this.constructQueryByFavorites();
        break;
      case "all":
        this.constructQueryBylectureId();
        break;
      default:
        break;
    }
  }

  private constructQueryByCategorie(catName: string) {
    const lectures = this._lecturesService.getLecturesByCatName(catName);

    // iset sources if app already download data
    if (lectures.length) {
      this.source = generateMultiPlaylist(lectures);
      this.startPosition = this.detectStartPosition(lectures, this.id);
      return;
    }

    // if not, wait for categories load event
    const subcsritption =
      this._globalStateService.onCategoryLecturesLoaded.subscribe(() => {
        const lectures = this._lecturesService.getLecturesByCatName(catName);

        this.source = generateMultiPlaylist(lectures);
        this.startPosition = this.detectStartPosition(lectures, this.id);
      });

    this.subscriptions.push(subcsritption);
  }

  private constructQueryByPlaylist(playlistId: string) {
    const lectures = this._playlistsService.getPlaylistLecturesById(playlistId);

    // set sources if app already download data
    if (lectures) {
      this.source = generateMultiPlaylist(lectures);
      this.startPosition = this.detectStartPosition(lectures, this.id);
      return;
    }

    // if not, wait for categories load event
    const subcsritption = this._globalStateService.onPlaylistsLoaded.subscribe(
      () => {
        const lectures =
          this._playlistsService.getPlaylistLecturesById(playlistId);
        this.source = generateMultiPlaylist(lectures);
        this.startPosition = this.detectStartPosition(lectures, this.id);
      }
    );

    this.subscriptions.push(subcsritption);
  }

  private constructQueryBylectureId() {
    const lectures = this._lecturesService.getAllLectures();
    const lecturesLimit = 35;

    // set sources if app already download data
    if (lectures) {
      const lectureIdx = lectures.findIndex(x => x.id === this.id);
      this.source = generateMultiPlaylist(
        lectures.slice(lectureIdx, lectureIdx + lecturesLimit)
      );
      return;
    }

    // if not, wait for categories load event
    const subcsritption = this._globalStateService.onLecturesLoaded.subscribe(
      () => {
        const lectures = this._lecturesService.getAllLectures();

        const lectureIdx = lectures.findIndex(x => x.id === this.id);
        this.source = generateMultiPlaylist(
          lectures.slice(lectureIdx, lectureIdx + lecturesLimit)
        );
      }
    );

    this.subscriptions.push(subcsritption);
  }

  private constructQueryByFavorites() {
    const lectures = this._favService.favorites;
    const lecturesLimit = 35;

    // set sources if app already download data
    if (lectures && lectures.length) {
      const lectureIdx = lectures.findIndex(x => x.id === this.id);
      this.source = generateMultiPlaylist(lectures);
      this.startPosition = lectureIdx;
      return;
    }

    // if not, wait for categories load event
    const subcsritption = this._globalStateService.onFavoritesLoaded.subscribe(
      () => {
        const lectures = this._favService.favorites;
        const lectureIdx = lectures.findIndex(x => x.id === this.id);
        this.source = generateMultiPlaylist(lectures);
        this.startPosition = lectureIdx;
      }
    );

    this.subscriptions.push(subcsritption);
  }

  async toggleFavorite() {
    try {
      this.isFavorite = !this.isFavorite;
      await this._favService.toggleFavorites(this.lectureData.id);
    } catch (error) {
      console.error(error);
      this.isFavorite = !this.isFavorite;
    }
  }

  setLectureData(data: ILecture) {
    this.lectureData = data;
    this.setFunctionsBarState();
    this._location.replaceState(
      "/lecture/" + this.lectureData.id,
      this.convertQueryParamsToString()
    );
  }

  private convertQueryParamsToString(): string {
    return `videoListType=${this.queryParams.videoListType}&videoListParams=${this.queryParams.videoListParams}`;
  }

  detectStartPosition(arr: ILecture[], id: number) {
    return arr.findIndex(x => x.id === id);
  }

  changeRepeatFunc() {
    if (this.repeatType + 1 === Object.keys(IRepeatTypes).length / 2) {
      return (this.repeatType = 0);
    }
    this.repeatType += 1;
  }

  markAsComplete() {
    this._progressService.markAsComplete(this.lectureData.id);
    this.isCompleted = true;
  }

  resetCompletion() {
    this._progressService.resetCompletion(this.lectureData.id);
    this.isCompleted = false;
  }

  downloadLecture() {
    this._downloadService.downloadSingleLecture(this.lectureData);
  }
}
