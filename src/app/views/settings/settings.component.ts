import { Component, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { FormControl, FormGroup } from "@angular/forms";
import { AuthorizationService } from "src/app/services/authorization.service";
import { NotificationService } from "src/app/services/notification.service";
import { Subscription } from "rxjs";
import { LocalStorage } from "src/libs/storage/src";
import { LecturesService } from "src/app/services/lectures.service";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  userSettings: any;
  userUid: string;
  user: any;
  settingsObserver: Subscription;
  englishCheck: boolean;
  hindiCheck: boolean;
  bengaliCheck: boolean;
  skeletonVisible = false;

  constructor(
    private _firestore: AngularFirestore,
    private _authService: AuthorizationService,
    private _notificationService: NotificationService,
    private _localStorage: LocalStorage,
    private _lectureService: LecturesService
  ) {
    this._authService.onSignIn.subscribe(() => this.getUserData());
  }

  ngOnInit(): void {
    this.getUserData();
  }

  notificationsForm = new FormGroup({
    english: new FormControl(false),
    hindi: new FormControl(false),
    bengali: new FormControl(false),
  });

  getUserData() {
    this.skeletonVisible = true;
    this.user = this._authService.getUser();
    if (!this.user) {
      return;
    }

    this.checkSettings();

    if (this.settingsObserver) {
      this.settingsObserver.unsubscribe();
    }

    this.settingsObserver = this._firestore
      .collection(`/users/${this.user.uid}/Settings`)
      .valueChanges()
      .subscribe((val: any) => {
        this.userSettings = val[0];
        this.englishCheck = this.userSettings.notification.english;
        this.hindiCheck = this.userSettings.notification.hindi;
        this.bengaliCheck = this.userSettings.notification.bengali;
        this.skeletonVisible = false;
      });
  }

  checkSettings() {
    this._firestore
      .doc(`/users/${this.user.uid}/Settings/userSettings`)
      .get()
      .toPromise()
      .then(docSnapshot => {
        if (!docSnapshot.exists) {
          let userData = {
            lastModificationTime: Date.now(),
            notification: {
              english: true,
              hindi: true,
              bengali: true,
            },
          };
          this._firestore
            .doc(`users/${this.user.uid}/Settings/userSettings`)
            .set(userData);
          this._notificationService.subcribeToTopic("BVKS_ENGLISH");
          this._notificationService.subcribeToTopic("BVKS_HINDI");
          this._notificationService.subcribeToTopic("BVKS_BENGALI");
        } else {
          return;
        }
      });
  }

  triggerNotification() {
    const lecture = this._lectureService.lectures[0];
    this._notificationService.setNotification({
      title: lecture.title.join(" "),
      date:
        "Date of recording: " +
        lecture.dateOfRecording.day +
        "-" +
        lecture.dateOfRecording.month +
        "-" +
        lecture.dateOfRecording.year,
      category: " Category: " + lecture.category.join(" "),
      verse: " Verse: " + lecture.legacyData.verse,
    });
  }

  async handleCheckboxSubcription(checkboxName: string, event$: any) {
    let topic;
    let checkboxValue;
    switch (checkboxName) {
      case "english":
        topic = "BVKS_ENGLISH";
        checkboxValue = this.englishCheck;
        break;
      case "hindi":
        topic = "BVKS_HINDI";
        checkboxValue = this.hindiCheck;
        break;
      case "bengali":
        topic = "BVKS_BENGALI";
        checkboxValue = this.bengaliCheck;
        break;
    }
    if (checkboxValue) {
      this._notificationService.subcribeToTopic(topic);
    } else {
      this._notificationService.unsubscribeFromTopic(topic);
    }
    let userData = {
      ...this.userSettings,
      lastModificationTime: Date.now(),
    };
    userData.notification[checkboxName] = checkboxValue;
    try {
      await this._firestore
        .doc(`users/${this.user.uid}/Settings/userSettings`)
        .update(userData);
    } catch (error) {
      throw error;
    }
  }
}
