import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AngularFireMessaging } from "@angular/fire/messaging";
import { BehaviorSubject } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { LocalStorage } from "src/libs/storage/src";
import { NotificationModel } from "../models/notification";

const serverKey =
  "AAAAKxH9UZw:APA91bEMT_5lEQW8a-DALrUEUww_b9k8rdrGzJWVMKYP2s59WlxURqs3NSILJMrgT6p78LZdytQQTAhB8rwfKTYCuSjbO-0xtw-Q5tjLUCgPkRgt05aGaNrQYI9J3hd1nGUEoc4ujGLV";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  token$: string;
  notification$: BehaviorSubject<NotificationModel> =
    new BehaviorSubject<NotificationModel>(null);

  constructor(
    private _messaging: AngularFireMessaging,
    private _localStorage: LocalStorage,
    private http: HttpClient
  ) {}

  requestPermission() {
    this._messaging.requestPermission.subscribe(
      () => {},
      (error: string) => {
        console.error(error);
      }
    );
  }

  requestToken() {
    this._messaging.requestToken.subscribe(
      (token: string) => {
        this.token$ = token;

        this._localStorage.setItem("bvks-token", JSON.stringify(token));
      },
      (error: string) => {
        console.error(error);
      }
    );
  }

  deleteToken() {
    this._messaging.getToken
      .pipe(mergeMap(token => this._messaging.deleteToken(token)))
      .subscribe(() => {});
  }

  // listenNotification() {
  //   this._messaging.messages.subscribe((message: any) => {
  //     this.setNotification({
  //       title: message.notification.title,
  //       body: message.notification.body,
  //     });
  //   });
  // }

  setNotification(notification: NotificationModel) {
    this.notification$.next(notification);
  }

  getNotification() {
    return this.notification$.asObservable();
  }

  subcribeToTopic(topic: string) {
    const headers = {
      Authorization: `key=${serverKey}`,
    };
    const body = {};
    this.http.post<any>(
      `https://iid.googleapis.com/iid/v1/${this.token$}/rel/topics/${topic}`,
      body,
      { headers }
    );
  }

  unsubscribeFromTopic(topic: string) {
    const headers = { Authorization: `key=${serverKey}` };
    this.http.delete<any>(
      `https://iid.googleapis.com/iid/v1/${this.token$}/rel/topics/${topic}`,
      { headers }
    );
  }
}
