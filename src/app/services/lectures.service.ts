import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { Subscription } from "rxjs";
import { take } from "rxjs/operators";
import { NotificationService } from "src/app/services/notification.service";
import { IUser } from "./../models/user";

import { ILecture } from "./../models/lecture";

import { AuthorizationService } from "./authorization.service";
import { GlobalStateService } from "./global-state.service";

@Injectable({
  providedIn: "root",
})
export class LecturesService {
  lectures: ILecture[];
  allLectures: ILecture[];
  topLectures: ILecture[];
  topLecturesId$: any;
  selectedLectures: ILecture[] = [];
  newLectureCount = 0;
  settingsObserver: Subscription;
  userSettings: string[] = [];
  user: IUser;

  lecturesByCategories: any = {
    latestUploads: [],
    topLectures: [],
    latestInEnglish: [],
    englishInHindi: [],
    bengalian: [],
    srimadBhagavatam: [],
    caritamrta: [],
    bhajans: [],
    bhagavad: [],
    visnu: [],
  };
  localLecturesCount: number;

  public lecturesByCatIsReady = false;
  public popularLecturesIsReady = false;
  public lecturesIsReady = false;

  constructor(
    private _firestore: AngularFirestore,
    private _firebaseAuth: AngularFireAuth,
    private _globalState: GlobalStateService,
    private _notificationService: NotificationService,
    private _authService: AuthorizationService
  ) {
    this._firebaseAuth.authState.subscribe(async state => {
      if (window.location.href.includes("/dashboard/text")) {
        return;
      }
      if (state) {
        this.lectures = await this._firestore
          .collection<ILecture>("lectures", ref => {
            return ref.orderBy("dateOfRecording.year", "desc").limit(1000);
          })
          .valueChanges()
          .pipe(take(1))
          .toPromise();

        this.lectures = this.lectures.sort((a, b) => {
          return (
            new Date(
              +b?.dateOfRecording.year,
              +b?.dateOfRecording.month - 1,
              +b?.dateOfRecording.day
            ).getTime() -
            new Date(
              +a?.dateOfRecording.year,
              +a?.dateOfRecording.month - 1,
              +a?.dateOfRecording.day
            ).getTime()
          );
        });

        this.allLectures = this.lectures;

        if (this.lectures.length) {
          await this.sortByCategories();

          this.sortLecturesByDateOfRecording();

          this.lecturesByCategories.latestUploads = this.lectures
            .sort((a, b) => {
              return (
                new Date(
                  +b?.dateOfRecording.year,
                  +b?.dateOfRecording.month - 1,
                  +b?.dateOfRecording.day
                ).getTime() -
                new Date(
                  +a?.dateOfRecording.year,
                  +a?.dateOfRecording.month - 1,
                  +a?.dateOfRecording.day
                ).getTime()
              );
            })
            .slice(0, 5);
        }

        this.getPopularLectures();
        this.getLatestLecturesInEnglish();
        this.getLatestLecturesInBengalian();
        this.getLatestLecturesInHindi();

        const lectures = await this._firestore
          .collection<ILecture>("lectures", ref => {
            return ref.orderBy("dateOfRecording", "desc");
          })
          .valueChanges()
          .pipe(take(1))
          .toPromise();
        this.lectures = this.allLectures = lectures;

        this.lectures = this.allLectures = this.lectures.filter(
          (l: ILecture) => l.length > 10
        );
        this._globalState.onLecturesLoaded.emit();
        this._globalState.onProgressChanged.emit(100);
        this.lecturesIsReady = true;

        this.getTopLecturesData();
        this._globalState.onCategoryLecturesLoaded.emit();
      }
      this.user = this._authService.getUser();
      this.localLecturesCount = await this.getAllLecturesLengthFromFirebase();
      this.settingsObserver = this._firestore
        .collection(`/users/${this.user.uid}/Settings`)
        .valueChanges()
        .subscribe((val: any) => {
          this.userSettings = [];
          if (!val[0]) {
            return;
          }
          const notifications = val[0].notification;
          for (const [key, value] of Object.entries(notifications)) {
            if (value === true && !this.userSettings.includes(key)) {
              switch (key) {
                case "hindi":
                  this.userSettings.push("हिन".toLowerCase());
                  break;
                case "bengali":
                  this.userSettings.push("বাংলা".toLowerCase());
                  break;
                case "english":
                  this.userSettings.push("english");
                  break;
                default:
                  break;
              }
            }
          }
        });
      this._firestore
        .collection<ILecture>("lectures")
        .valueChanges()
        .subscribe(lectures => {
          const filteredLecturesByTimeStamp = lectures.sort(
            (a, b) =>
              new Date(
                +b?.dateOfRecording.year,
                +b?.dateOfRecording.month - 1,
                +b?.dateOfRecording.day
              ).getTime() -
              new Date(
                +a?.dateOfRecording.year,
                +a?.dateOfRecording.month - 1,
                +a?.dateOfRecording.day
              ).getTime()
          );
          if (lectures.length - 1 === this.localLecturesCount) {
            this._notificationService.setNotification({
              title: filteredLecturesByTimeStamp[0].title.join(" "),
              date:
                filteredLecturesByTimeStamp[0].dateOfRecording.day +
                "-" +
                filteredLecturesByTimeStamp[0].dateOfRecording.month +
                "-" +
                filteredLecturesByTimeStamp[0].dateOfRecording.year,
              category: filteredLecturesByTimeStamp[0].category.join(" "),
              verse: filteredLecturesByTimeStamp[0].legacyData.verse,
            });
            this.localLecturesCount += 1;
          }
        });
    });
  }

  async getLectureById(id: number) {
    return JSON.parse(JSON.stringify(this.allLectures.find(x => x.id === id)));
  }

  async getAllLecturesLengthFromFirebase() {
    const res = await this._firestore
    .collection<ILecture>("lectures")
    .valueChanges()
    .pipe(take(1))
    .toPromise();
  return res.length;
  }

  async getLectureByIdFromFirebase(id: number) {
    const lectures = await this._firestore
    .collection<ILecture>("lectures", ref => ref.where("id", "==", id))
    .valueChanges()
    .pipe(take(1))
    .toPromise();

  return lectures;
  }

  async getTopLecturesData() {
   // initial call
    this.getTopLecturesAllTime();
    this._globalState.onPeriodChange.subscribe(() => {
      if (this._globalState.periodRequest === "All-time") {
        this.getTopLecturesAllTime();
      } else {
        this.getTopLecturesByPeriod();
      }
    });
  }

  getTopLecturesAllTime() {
    function compareByViews(a: any, b: any) {
      if (a.resources.audios[0].views > b.resources.audios[0].views) {
        return -1;
      }
      if (a.resources.audios[0].views < b.resources.audios[0].views) {
        return 1;
      }
      return 0;
    }
    const sortedByViews = this.allLectures.sort(compareByViews).slice(0, 100);
    this.topLectures = sortedByViews;
    this.lecturesByCategories.topLectures = [...this.topLectures.slice(0, 5)];
  }

  async getTopLecturesByPeriod() {
    const today = new Date();
    let condition: number;
    switch (this._globalState.periodRequest) {
      case "This month":
        const pastmonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          today.getDate()
        );
        condition = pastmonth.getTime();
        break;
      case "This week":
        const pastweek = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 7
        );
        condition = pastweek.getTime();
        break;
      case "Today":
        const yesterday = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 1
        );
        condition = yesterday.getTime();
        break;
    }
    this.topLecturesId$ = this._firestore
      .collection("TopLectures", ref =>
        ref.where("creationTimestamp", ">=", condition)
      )
      .valueChanges()
      .pipe(take(1))
      .subscribe((data: any) => {
        //
        const mergedPlayedIds: any[] = [];
        for (let i = 0; i < data.length; i++) {
          mergedPlayedIds.push(...data[i].playedIds);
        }
        const idsCount = mergedPlayedIds.reduce(
          (acc: any, n: any) => ((acc[n] = (acc[n] || 0) + 1), acc),
          {}
        );
        const sortedByCount = Object.entries(idsCount)
          .sort((a: any, b: any) => b[1] - a[1])
          .map(el => Number(el[0]))
          .slice(0, 100);
        const findedLectures = sortedByCount
          .map(elem => this.allLectures.find((item: any) => item.id === elem))
          .filter(x => x !== undefined);
        this.topLectures = findedLectures;
      });
  }

  getLatestLecturesInEnglish() {
    this.lecturesByCategories.latestInEnglish = this.allLectures.filter(
      (lecture: ILecture) => lecture.language.main == "English"
    );

    this.lecturesByCategories.latestInEnglish =
      this.lecturesByCategories.latestInEnglish.sort(
        (a: ILecture, b: ILecture) => {
          return (
            new Date(
              +b?.dateOfRecording.year,
              +b?.dateOfRecording.month - 1,
              +b?.dateOfRecording.day
            ).getTime() -
            new Date(
              +a?.dateOfRecording.year,
              +a?.dateOfRecording.month - 1,
              +a?.dateOfRecording.day
            ).getTime()
          );
        }
      );
  }

  getLatestLecturesInHindi() {
    this.lecturesByCategories.englishInHindi = this.allLectures.filter(
      (lecture: ILecture) => lecture.language.main == "हिन्दी"
    );

    this.lecturesByCategories.englishInHindi =
      this.lecturesByCategories.englishInHindi.sort(
        (a: ILecture, b: ILecture) => {
          return (
            new Date(
              +b?.dateOfRecording.year,
              +b?.dateOfRecording.month - 1,
              +b?.dateOfRecording.day
            ).getTime() -
            new Date(
              +a?.dateOfRecording.year,
              +a?.dateOfRecording.month - 1,
              +a?.dateOfRecording.day
            ).getTime()
          );
        }
      );
  }

  getLatestLecturesInBengalian() {
    this.lecturesByCategories.bengalian = this.allLectures.filter(
      (lecture: ILecture) => lecture.language.main == "বাংলা"
    );
  }

  getPopularLectures() {
    this.lecturesByCategories.popular = this.allLectures.filter(
      (lecture: ILecture) => lecture.resources.audios[0].views > 10
    );
  }

  getLecturesByCatName(name: string): ILecture[] {
    return this.lecturesByCategories[name];
  }

  getAllLectures(): ILecture[] {
    if (!this.allLectures) {
      return;
    }

    return this.allLectures;
  }

  async sortByCategories() {
    this.lectures?.forEach((lecture: ILecture) => {
      if (lecture.category) {
        switch (lecture.category[0]) {
          case "Śrīmad-Bhāgavatam":
            this.lecturesByCategories.srimadBhagavatam.push(lecture);
            break;
          case "हिन्दी":
            this.lecturesByCategories.englishInHindi.push(lecture);
            break;
          case "Śrī Caitanya-caritāmṛta":
            this.lecturesByCategories.caritamrta.push(lecture);
            break;
          case "Bhagavad-gītā":
            this.lecturesByCategories.bhagavad.push(lecture);
            break;
          case "Bhajans":
            this.lecturesByCategories.bhajans.push(lecture);
            break;
          case "Viṣṇu-sahasranāma":
            this.lecturesByCategories.visnu.push(lecture);
            break;
        }
      }
    });
    this.lecturesByCatIsReady = true;
  }

  sortLecturesByDateOfRecording() {
    for (let key in this.lecturesByCategories) {
      this.lecturesByCategories[key] = this.lecturesByCategories[key].sort(
        (a: ILecture, b: ILecture) => {
          return (
            new Date(
              +b?.dateOfRecording.year,
              +b?.dateOfRecording.month - 1,
              +b?.dateOfRecording.day
            ).getTime() -
            new Date(
              +a?.dateOfRecording.year,
              +a?.dateOfRecording.month - 1,
              +a?.dateOfRecording.day
            ).getTime()
          );
        }
      );
    }
  }

  setLectures(lectures: ILecture[]) {
    this.lectures = lectures;
  }

  getPlaylistsLectures(lectureIds: number[]): ILecture[] {
    return this.allLectures.filter(x => lectureIds.includes(x.id));
  }

  getTotalAudios() {
    let totalAudios = 0;
    this.allLectures?.forEach(l =>
      l.resources.audios.length ? (totalAudios += 1) : null
    );
    return totalAudios;
  }
}
