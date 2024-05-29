import { Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import videojs from "video.js";
import "videojs-youtube";
import "videojs-playlist";
import { LecturesProgressService } from "src/app/services/lectures-progress.service";
import { IUser, IUserLecture } from "src/app/models/user";
import { AuthorizationService } from "src/app/services/authorization.service";
import { ILecture, IRepeatTypes } from "src/app/models/lecture";
import { environment } from "./../../../environments/environment";
import { FavoritesService } from "src/app/services/favorites.service";
import { AudioplayerService } from "src/app/services/audioplayer.service";
import { IPlayerPlaylistSources } from "src/app/models/player";
import { StatisticService } from "src/app/services/statistic.service";
import { ShareService } from "./../../services/share.service";
import { DownloadsService } from "src/app/services/downloads.service";
import { ModalService } from "src/app/services/modal.service";

@Component({
  selector: "app-audioplayer",
  templateUrl: "./audioplayer.component.html",
  styleUrls: ["./audioplayer.component.scss"],
  host: {
    "(document:click)": "detectClickOutsideMoreOptions($event)",
  },
})
export class AudioplayerComponent implements OnInit {
  @ViewChild("audioplayer", { static: true }) target: ElementRef;
  @ViewChild("moreOptionsBtn") moreOptionsBtn: ElementRef;

  isPlayerEnabled = false;

  // vieojs-youtube plugin https://www.npmjs.com/package/videojs-youtube
  options: videojs.PlayerOptions = {
    autoplay: true,
    controls: true,
    muted: false,
    height: 0,

    width: 800,
    playbackRates: [0.5, 0.75, 1, 1.15, 1.25, 1.5, 1.75, 2],
    controlBar: {
      playToggle: true,
    },
    //@ts-ignore
    youtube: { autoplay: 1 },
  };

  player: videojs.Player;
  progressBar: videojs.ProgressControl;
  updateTimer: any;
  currentItemIdx: number;
  playlistLength: number;
  isPlayerReady = false;

  thumbnail: string;
  repeatType: IRepeatTypes = 0;
  isLectureFavorite = false;

  lectureData: ILecture;
  lectureProgressData: IUserLecture;
  user: IUser;
  timeStampFromUrl: number;

  isMoreOptionsOpen = false;
  isPrevBtnDisabled: boolean;
  isNextBtnDisabled: boolean;

  constructor(
    private _lecturesProgressService: LecturesProgressService,
    private _authService: AuthorizationService,
    private _shareService: ShareService,
    private _favoritesService: FavoritesService,
    private _audioplayerService: AudioplayerService,
    private _statisticService: StatisticService,
    private _downloadService: DownloadsService,
    private _modalService: ModalService
  ) {}

  async ngOnInit() {
    this.user = this._authService.getUser();

    this._audioplayerService.onPlayerClose.subscribe(() => {
      this.closePlayer();
    });

    this._audioplayerService.onDataSetup.subscribe(playListData => {
      if (this.compareReceivedLecture(playListData)) {
        return;
      }

      if (playListData.startTime) {
        this.timeStampFromUrl = playListData.startTime;
      }

      if (!this.isPlayerEnabled) {
        this.initPlayer(playListData);
        return;
      }
      //@ts-ignore
      this.player.playlist(playListData.data);
      this.playlistLength = playListData.data.length;
      //@ts-ignore
      this.player.playlist.currentItem(playListData.startPosition);
    });
  }

  initPlayer(playList: IPlayerPlaylistSources) {
    this.isPlayerEnabled = true;

    // instantiate Video.js
    this.player = videojs(this.target.nativeElement, this.options, () => {
      //@ts-ignore
      this.player.playlist(playList.data);
      this.playlistLength = playList.data.length;

      //@ts-ignore
      this.player.playlist.currentItem(playList.startPosition);
      //@ts-ignore
      this.player.playlist.autoadvance(0);
      this.updateCurrentItemIdx();
      this.getLectureData();
    });

    // ____________________________________________
    // ------------- EVENTS BLOCK -----------------
    // ____________________________________________

    this.player.controlBar.on("tap", () => {
      this.sendLectureTimeStamp();
    });

    this.player.on("beforeplaylistitem", () => {
      this.sendLectureTimeStamp();
    });

    this.player.on("ended", () => {
      this.sendLectureTimeStamp();
      clearInterval(this.updateTimer);
    });

    this.player.on("play", () => {
      if (!this.player.currentTime()) return;
      this.sendLectureTimeStamp();
    });
    this.player.on("pause", () => {
      if (!this.player.currentTime()) return;
      this.sendLectureTimeStamp();
    });
    this.player.on("seeked", () => {
      if (this.player.currentTime() < 1) return;

      this.sendLectureTimeStamp();
    });
    this.player.on("playlistitem", () => {
      // if video was ended at last time, restart
      this.updateCurrentItemIdx();
      this.resetPlayerAfterPlaylistChange();
      this.getLectureData();
    });
    this.player.on("loadeddata", () => {
      this.setCurrentTime();
      this.incrementStatistic();
      this.isPlayerReady = true;

      // log timeStamp every interval iteration
      this.updateTimer = setInterval(() => {
        this._statisticService.setListenInfo(this.lectureData);
        this.sendLectureTimeStamp();
      }, 10000);
    });

    // ____________________________________________
    // ------------------ END ---------------------
    // ____________________________________________
  }

  updateCurrentItemIdx() {
    // @ts-ignore
    this.currentItemIdx = this.player.playlist.currentItem();
  }

  getLectureData() {
    this.lectureData =
      //@ts-ignore
      this.player.playlist()[this.currentItemIdx].lectureData;

    this.thumbnail = this.lectureData.thumbnail
      ? this.lectureData.thumbnail
      : environment.lectionThumbnailPlaceholder;

    this.lectureProgressData =
      this._lecturesProgressService.getProgressByLectureId(this.lectureData.id);

    this.isLectureFavorite = this._favoritesService.isLectureInFavorites(
      this.lectureData.id
    );
  }

  playNextLecture() {
    // @ts-ignore
    this.player.playlist.next();
    this.resetPlayerAfterPlaylistChange();
  }

  playPrevLecture() {
    // @ts-ignore
    this.player.playlist.previous();
    this.resetPlayerAfterPlaylistChange();
  }

  resetPlayerAfterPlaylistChange() {
    this.isPlayerReady = false;
    clearInterval(this.updateTimer);
    this.toggleNextBtnDisplay();
    this.togglePrevBtnDisplay();
  }

  togglePrevBtnDisplay() {
    this.isPrevBtnDisabled = this.currentItemIdx <= 0 && this.repeatType !== 2;
  }

  toggleNextBtnDisplay() {
    this.isNextBtnDisabled =
      this.currentItemIdx === this.playlistLength - 1 && this.repeatType !== 2;
  }

  goBackward() {
    const currTime = this.player.currentTime();
    const timePeriod = 10;

    this.setCurrentTime();
    this.player.currentTime(currTime - timePeriod);
  }

  goForward() {
    const currTime = this.player.currentTime();
    const timePeriod = 10;

    this.setCurrentTime();
    this.player.currentTime(currTime + timePeriod);
  }

  sendLectureTimeStamp() {
    if (!this.isPlayerReady) {
      return;
    }

    const currTime = this.player.currentTime();
    const totallength = this.player.duration();

    if (currTime + 3 >= totallength) {
      // if lecture reach the end, mark it as complete
      this.lectureProgressData.isCompleted = true;
      this._lecturesProgressService.markAsComplete(this.lectureData.id);
      return;
    }

    this._lecturesProgressService.updateLectureProgress({
      ...this.lectureProgressData,
      lastPlayedPoint: currTime,
      totallength,
    });
  }

  setCurrentTime() {
    if (this.timeStampFromUrl) {
      this.player.currentTime(this.timeStampFromUrl);
      this.timeStampFromUrl = null;

      return;
    }

    if (!this.lectureProgressData) {
      return;
    }

    if (
      this.player.duration() <=
      this.lectureProgressData.lastPlayedPoint + 3
    ) {
      this.player.currentTime(0);
    } else {
      this.player.currentTime(this.lectureProgressData.lastPlayedPoint);
    }
  }

  toggleComplete() {
    if (this.lectureProgressData.isCompleted) {
      this.lectureProgressData.isCompleted = false;
      this._lecturesProgressService.resetCompletion(this.lectureData.id);

      // refresh time stamp after reset complete option
      this.sendLectureTimeStamp();
    } else {
      this.lectureProgressData.isCompleted = true;
      this._lecturesProgressService.markAsComplete(this.lectureData.id);
    }
  }

  shuffle() {
    //@ts-ignore
    this.player.playlist.shuffle();
    this.getLectureData();
  }

  changeRepeatFunc() {
    // set func type
    if (this.repeatType + 1 === Object.keys(IRepeatTypes).length / 2) {
      this.repeatType = 0;
    } else {
      this.repeatType += 1;
    }

    switch (this.repeatType) {
      case 0:
        // @ts-ignore
        this.player.playlist.repeat(false);
        this.player.loop(false);
        break;
      // loop video
      case 1:
        // @ts-ignore
        this.player.playlist.repeat(false);
        this.player.loop(true);
        break;
      // repeat playlist
      case 2:
        // @ts-ignore
        this.player.playlist.repeat(true);
        this.player.loop(false);
        break;
    }

    // update player btns
    this.toggleNextBtnDisplay();
    this.togglePrevBtnDisplay();
  }

  async toggleFavorite() {
    this.isLectureFavorite = !this.isLectureFavorite;
    try {
      await this._favoritesService.toggleFavorites(this.lectureData.id);
    } catch (error) {
      this.isLectureFavorite = !this.isLectureFavorite;
    }
  }

  toggleMoreOptions() {
    this.isMoreOptionsOpen = !this.isMoreOptionsOpen;
  }

  incrementStatistic() {
    this._statisticService.incrementLectureViews(this.lectureData.id);
  }

  downloadLecture() {
    this._downloadService.downloadSingleLecture(this.lectureData);
  }

  addToPlaylist() {
    this._modalService.addToPlaylist([this.lectureData.id]);
  }

  closePlayer() {
    if (!this.player) {
      return;
    }

    this.isPlayerEnabled = false;

    //@ts-ignore
    this.player.pause();

    if (this.player.currentTime() !== 0) {
      this.sendLectureTimeStamp();
    }

    clearInterval(this.updateTimer);
  }

  detectClickOutsideMoreOptions(event: any) {
    if (!this.moreOptionsBtn.nativeElement?.contains(event.target)) {
      this.isMoreOptionsOpen = false;
    }
  }

  ngOnDestroy() {
    // exit if player doesn`t initialized
    if (!this.player) {
      return;
    }
    if (this.player.currentTime() !== 0) {
      this.sendLectureTimeStamp();
    }
    // destroy player instance
    if (this.player) {
      this.player.dispose();
    }
    clearInterval(this.updateTimer);
  }

  shareLink() {
    const progress = this.player.currentTime();

    this._shareService.copyLinkToClipboard(
      this.lectureData.id,
      progress,
      false
    );
  }

  compareReceivedLecture(playlistData: IPlayerPlaylistSources) {
    if (this.lectureData === undefined) {
      return;
    }

    const receivedId =
      playlistData.data[playlistData.startPosition].lectureData.id;

    if (receivedId !== this.lectureData.id) {
      return;
    }

    if (this.player.paused()) {
      this.player.play();
    } else {
      this.player.pause();
    }

    return true;
  }
}
