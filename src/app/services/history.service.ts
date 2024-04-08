import { ILectureInfo } from "./../models/lecture-info";
import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";

import { take } from "rxjs/operators";

import { AuthorizationService } from "./authorization.service";
import { LecturesService } from "src/app/services/lectures.service";

import { ILecture } from "./../models/lecture";

@Injectable({
  providedIn: "root",
})
export class HistoryService {
  public historyLecturesIsReady: boolean;

  private lectures: ILecture[] = [];
  private lecturesByWeek: ILecture[] = [];
  private lecturesByMonth: ILecture[] = [];
  private userId: string;

  readonly WEEK_IN_MS = 604800000;
  readonly MONTH_IN_MS = 2592000000;

  get allLectures(): ILecture[] {
    return this.lectures;
  }

  get allLecturesByWeek() {
    return this.lecturesByWeek;
  }

  get allLecturesByMonth() {
    return this.lecturesByMonth;
  }

  constructor(
    private _firestore: AngularFirestore,
    private _authorizationService: AuthorizationService,
    private _lecturesService: LecturesService
  ) {}

  async initUserHistory() {
    const weekAgoDate = new Date().getTime() - this.WEEK_IN_MS;
    const monthAgoDate = new Date().getTime() - this.MONTH_IN_MS;

    this.historyLecturesIsReady = false;

    this.userId = this._authorizationService.user?.uid;

    this.lectures = (
      await this.getLecturesInHistory(await this.getLecturesId())
    ).slice(0, 100);

    this.lecturesByWeek = await this.getLecturesInHistory(
      await this.getLecturesIdByPeriod(weekAgoDate)
    );

    this.lecturesByMonth = await this.getLecturesInHistory(
      await this.getLecturesIdByPeriod(monthAgoDate)
    );

    this.historyLecturesIsReady = true;
  }

  async clearHistory() {
    const lecturesInfo = await this._firestore
      .collection("users", ref => ref.where("lastPlayedPoint", ">", 0))
      .doc(this.userId)
      .collection("lectureInfo")
      .valueChanges()
      .pipe(take(1))
      .toPromise();

    lecturesInfo.forEach(l => {
      l.lastPlayedPoint = 0;

      this._firestore
        .collection("users")
        .doc(this.userId)
        .collection("lectureInfo")
        .doc(l.documentId)
        .set(l);
    });

    this.lectures.length = 0;
    this.lecturesByWeek.length = 0;
    this.lecturesByMonth.length = 0;
  }

  private async getLecturesInHistory(ids: any): Promise<ILecture[]> {
    const lecturesId = await ids;

    const lectures = [];

    for (let i = 0; i < lecturesId.length; i++) {
      const lecture = this._lecturesService.allLectures.find(l => {
        return l.id === lecturesId[i];
      });

      if (lecture) {
        lectures.push(lecture);
      } else {
      }
    }

    return lectures;
  }

  private async getLecturesId(): Promise<number[]> {
    const lectureIds = new Set<number>();

    let lecturesInfo = await this._firestore
      .collection("users")
      .doc(this.userId)
      .collection("lectureInfo", ref => {
        return ref.orderBy("lastModifiedTimestamp", "desc");
      })
      .valueChanges()
      .pipe(take(1))
      .toPromise();

    lecturesInfo = lecturesInfo.filter((lectureInfo: ILectureInfo) => {
      return lectureInfo.lastPlayedPoint > 0;
    });

    lecturesInfo.forEach((lecture: ILecture) => {
      if (lecture.id) {
        lectureIds.add(lecture.id);
      }
    });

    return [...lectureIds];
  }

  private async getLecturesIdByPeriod(period: number): Promise<number[]> {
    const lectureIds = new Set<number>();

    let lecturesInfo = await this._firestore
      .collection("users")
      .doc(this.userId)
      .collection("lectureInfo", ref => {
        return ref.where("lastModifiedTimestamp", ">", period);
      })
      .valueChanges()
      .pipe(take(1))
      .toPromise();

    lecturesInfo = lecturesInfo.filter((lectureInfo: ILectureInfo) => {
      return lectureInfo.lastPlayedPoint > 0;
    });

    lecturesInfo = lecturesInfo?.sort((a: any, b: any) => {
      return +b?.lastModifiedTimestamp - +a?.lastModifiedTimestamp;
    });

    lecturesInfo.forEach((lecture: ILecture) => {
      if (lecture.id) {
        lectureIds.add(lecture.id);
      }
    });

    return [...lectureIds];
  }
}
