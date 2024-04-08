import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Subscription } from "rxjs";
import { NotificationModel } from "src/app/models/notification";
import { NotificationService } from "src/app/services/notification.service";

@Component({
  selector: "app-notification",
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class NotificationComponent implements OnInit {
  showPanel: boolean;
  notification: NotificationModel;
  notificationSub: Subscription;
  notificationTimeout: any;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationSub = this.notificationService
      .getNotification()
      .subscribe(notification => {
        this.notification = notification;
        this.showPanel = notification !== null;
        this.notificationTimeout = setTimeout(() => {
          this.showPanel = false;
        }, 15000);
      });
  }

  dismissNotification() {
    this.showPanel = false;
  }

  ngOnDestroy() {
    this.notificationSub.unsubscribe();
    clearTimeout(this.notificationTimeout);
  }
}
