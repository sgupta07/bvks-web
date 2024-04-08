import { LecturesService } from "src/app/services/lectures.service";
import { Component, OnInit, OnDestroy } from "@angular/core";

import { Subscription } from "rxjs";

import { GlobalStateService } from "src/app/services/global-state.service";

@Component({
  selector: "app-progress-bar",
  templateUrl: "./progress-bar.component.html",
  styleUrls: ["./progress-bar.component.scss"],
})
export class ProgressBarComponent implements OnInit, OnDestroy {
  progressLineWidth = 0;
  progressLineOpacity = 1;

  private progressUpInterval: any;
  private progressSubscription: Subscription;

  constructor(
    private _globalStateService: GlobalStateService,
    private _lecturesService: LecturesService
  ) {
    this.createSubscriptionOnProgressChange();
  }

  ngOnInit(): void {
    this.createProgressUpInterval();
  }

  ngOnDestroy(): void {
    this.progressSubscription.unsubscribe();
  }

  private createSubscriptionOnProgressChange() {
    this.progressSubscription =
      this._globalStateService.onProgressChanged.subscribe(
        (progress: number) => {
          this.changeProgressValue(progress);

          if (progress === 100) this.hideCompletedProgressBar();
        }
      );
  }

  private createProgressUpInterval() {
    this.progressUpInterval = setInterval(() => {
      if (this.progressLineWidth > 70) {
        clearInterval(this.progressUpInterval);

        return;
      }

      this.progressLineWidth += 10;
    }, 800);
  }

  private hideCompletedProgressBar() {
    setTimeout(() => {
      this.progressLineOpacity = 0;
    }, 500);
  }

  private changeProgressValue(progress: number) {
    this.progressLineWidth = progress;
  }
}
