import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { map, take } from "rxjs/operators";
import { ILecture } from "../models/lecture";
import {
  CategoryAbbr,
  ICustomPeriodInfo,
  IListenInfo,
  IPeriodStat,
} from "./../models/statistics";
import { IUser, IUserLecture } from "./../models/user";
import { AuthorizationService } from "./authorization.service";

@Injectable({
  providedIn: "root",
})
export class StatisticService {
  user: IUser;
  timeIncrementorInSeconds = 10;

  constructor(
    private _firestoreService: AngularFirestore,
    private _authService: AuthorizationService,
    private _firestore: AngularFirestore,
    private _firebaseAuth: AngularFireAuth
  ) {}

  // =================
  // statistic getters
  // =================

  getThisWeekListened(listenInfo: IListenInfo[]) {
    return this.calculateStatistic(this.calcThisWeekInfo(listenInfo));
  }

  getLastWeekListened(listenInfo: IListenInfo[]) {
    return this.calculateStatistic(this.calcLastWeekInfo(listenInfo));
  }

  getLastMonthListened(listenInfo: IListenInfo[]) {
    return this.calculateStatistic(this.calcLastMonthInfo(listenInfo));
  }

  getAllTimeListened(listenInfo: IListenInfo[]) {
    return this.calculateStatistic(listenInfo);
  }

  getCustomListened(
    from: ICustomPeriodInfo,
    to: ICustomPeriodInfo,
    listenInfo: IListenInfo[]
  ) {
    return this.calculateStatistic(this.filterCustomInfo(from, to, listenInfo));
  }

  // ======================
  // lectures views section
  // ======================

  async incrementLectureViews(id: number) {
    let data = await this.getActuaLectureData(id);
    data.resources.audios[0].views += 1;

    this._firestoreService
      .collection<ILecture>("lectures")
      .doc(data.fbId)
      .update({ resources: data.resources });
  }

  async getActuaLectureData(id: number) {
    return await this._firestoreService
      .collection<ILecture>("lectures", ref => ref.where("id", "==", id))
      .get()
      .pipe(
        map(val => {
          return { fbId: val.docs[0].id, ...val.docs[0].data() };
        })
      )
      .toPromise();
  }

  // ========================
  // statitstics calc methods
  // ========================

  async getListenInfo() {
    if (!this.user) {
      return;
    }
    return await this._firestore
      .collection<IListenInfo>(`/users/${this.user.uid}/listenInfo/`)
      .valueChanges()
      .pipe(take(1))
      .toPromise();
  }

  async requestTotalListened() {
    this.user = await this._firebaseAuth.user.pipe(take(1)).toPromise();
    if (!this.user) {
      return;
    }
    const totalListened = await this._firestore
      .collection<IUserLecture[]>(
        `/users/${this.user.uid}/lectureInfo/`,
        ref => {
          return ref.where("isCompleted", "==", true);
        }
      )
      .valueChanges()
      .pipe(take(1))
      .toPromise();
    return totalListened.length;
  }

  calculateStatistic(listenInfos: IListenInfo[]) {
    let periodStat: IPeriodStat = {} as IPeriodStat;
    periodStat.audio = this.sum(listenInfos, "audioListen");
    periodStat.BG = this.sumCategory(listenInfos, CategoryAbbr.BG);
    periodStat.CC = this.sumCategory(listenInfos, CategoryAbbr.CC);
    periodStat.SB = this.sumCategory(listenInfos, CategoryAbbr.SB);
    periodStat.Seminars = this.sumCategory(listenInfos, CategoryAbbr.Seminars);
    periodStat.VSN = this.sumCategory(listenInfos, CategoryAbbr.VSN);
    periodStat.others = this.sumCategory(listenInfos, CategoryAbbr.others);
    return periodStat;
  }

  private sum<T>(listenInfo: T[], field: keyof T) {
    return listenInfo.reduce((sum, x) => (sum += Number(x[field])), 0);
  }
  private sumCategory(listenInfo: IListenInfo[], category: CategoryAbbr) {
    return listenInfo?.reduce(
      (sum, x) => (sum += x.listenDetails[category]),
      0
    );
  }
  private filterCustomInfo(
    from: ICustomPeriodInfo,
    to: ICustomPeriodInfo,
    listenInfo: IListenInfo[]
  ) {
    const fromTimeStamp = Date.parse(
      new Date(from.year, from.month, from.day).toISOString()
    );
    const toTimeStamp = Date.parse(
      new Date(to.year, to.month, to.day).toISOString()
    );
    const customInfo = listenInfo.filter(info => {
      return (
        info.creationTimestamp >= fromTimeStamp &&
        info.creationTimestamp <= toTimeStamp
      );
    });
    return customInfo;
  }

  private calcLastMonthInfo(listenInfo: IListenInfo[]) {
    const currentMonth = new Date().getMonth() + 1;
    const lastMonthInfo = listenInfo.filter(
      info => info.dateOfRecord.month === currentMonth
    );

    return lastMonthInfo;
  }

  private calcThisWeekInfo(listenInfo: IListenInfo[]) {
    const curr = new Date();
    const firstDayOfThisWeek = curr.getDate() - curr.getDay();
    const lastDayOfThisWeek = firstDayOfThisWeek + 6;

    const thisWeekInfo = listenInfo.filter(
      info =>
        info.dateOfRecord.day >= firstDayOfThisWeek &&
        info.dateOfRecord.day <= lastDayOfThisWeek
    );
    return thisWeekInfo;
  }

  private calcLastWeekInfo(listenInfo: IListenInfo[]) {
    const curr = new Date();
    const firstDayOfLastWeek = curr.getDate() - curr.getDay() - 7;
    const lastDayOfLastWeek = firstDayOfLastWeek + 6;
    const lastWeekInfo = listenInfo.filter(
      info =>
        info.dateOfRecord.day >= firstDayOfLastWeek &&
        info.dateOfRecord.day <= lastDayOfLastWeek
    );
    return lastWeekInfo;
  }

  // ======================
  // listenInfo section
  // ======================

  async setListenInfo(lectureData: ILecture) {
    const date = new Date();
    const dateId = this.generateDateId(date);

    if (!this.user) {
      this.user = this._authService.getUser();
    }

    let listenInfoData: IListenInfo = await this.getListenInfoByDayFromFB(
      this.user,
      dateId
    );

    // if doesn exist create new and exit from func
    if (!listenInfoData) {
      await this.generateNewListenInfoObj(lectureData, dateId);
      return;
    }

    await this.updateListenInfo(listenInfoData, lectureData);
  }

  async updateListenInfo(oldListenInfo: IListenInfo, lectureData: ILecture) {
    // get copy of listen data
    let listenInfoData: IListenInfo = JSON.parse(JSON.stringify(oldListenInfo));

    // increment listen time
    listenInfoData.audioListen += this.timeIncrementorInSeconds;

    // add lecture id in playedIds array
    if (!listenInfoData.playedIds.includes(lectureData.id)) {
      listenInfoData.playedIds.push(lectureData.id);
    }

    // update category time
    this.updateCategoryTime(listenInfoData, lectureData.category);

    // update last modified time stamp
    listenInfoData.lastModifiedTimestamp = Date.now();

    // send updated data to the fireBase
    await this._firestore.doc(listenInfoData.documentPath).set(listenInfoData);
  }

  private generateDateId(date: Date): string {
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  }

  private async getListenInfoByDayFromFB(user: IUser, dateId: string) {
    const listenInfo = await this._firestore
      .collection<IListenInfo>(`/users/${user.uid}/listenInfo/`)
      .doc(dateId)
      .valueChanges()
      .pipe(take(1))
      .toPromise();

    return listenInfo;
  }

  private async generateNewListenInfoObj(
    lectureInfo: ILecture,
    dateId: string
  ) {
    const date = new Date();

    // genareate new listeInfo object
    const listenInfo: IListenInfo = {
      audioListen: this.timeIncrementorInSeconds,
      creationTimestamp: Date.now(),
      date: date.toString(),
      dateOfRecord: {
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
      },
      documentId: dateId,
      documentPath: `users/${this.user.uid}/listenInfo/${dateId}`,
      lastModifiedTimestamp: Date.now(),
      listenDetails: {
        BG: 0,
        CC: 0,
        SB: 0,
        Seminars: 0,
        VSN: 0,
        others: 0,
      },
      playedIds: [lectureInfo.id],
      videoListen: 0,
    };

    // send it to the fireBase
    await this._firestore
      .collection<IListenInfo>(`/users/${this.user.uid}/listenInfo/`)
      .doc(dateId)
      .set(listenInfo);
  }

  private updateCategoryTime(
    listenInfo: IListenInfo,
    lectureCategories: string[]
  ) {
    if (!lectureCategories || !lectureCategories.length) {
      return;
    }

    lectureCategories.forEach(category => {
      switch (category) {
        case "Bhagavad-gītā":
          listenInfo.listenDetails.BG += this.timeIncrementorInSeconds;
          break;
        case "Śrīmad-Bhāgavatam":
          listenInfo.listenDetails.SB += this.timeIncrementorInSeconds;
          break;
        case "Śrī Caitanya-caritāmṛta":
          listenInfo.listenDetails.CC += this.timeIncrementorInSeconds;
          break;
        case "Seminars":
          listenInfo.listenDetails.Seminars += this.timeIncrementorInSeconds;
          break;
        case "Viṣṇu-sahasranāma":
          listenInfo.listenDetails.VSN += this.timeIncrementorInSeconds;
          break;
        default:
          listenInfo.listenDetails.others += this.timeIncrementorInSeconds;
          break;
      }
    });
  }
}
