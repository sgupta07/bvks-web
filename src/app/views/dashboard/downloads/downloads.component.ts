import { Component, OnInit, OnDestroy } from "@angular/core";

import { Subscription } from "rxjs";

import { GlobalStateService } from "./../../../services/global-state.service";
import { DownloadsService } from "src/app/services/downloads.service";

import { IDownloadsItem } from "src/app/models/lecture";

@Component({
  selector: "app-downloads",
  templateUrl: "./downloads.component.html",
  styleUrls: ["./downloads.component.scss"],
})
export class DownloadsComponent implements OnInit, OnDestroy {
  data: IDownloadsItem[];

  downloadsStatusChecker: Subscription;

  get downloadsStatuses(): boolean[] {
    return this._downloadsService.allDownloadStatuses;
  }

  constructor(
    private _downloadsService: DownloadsService,
    private _globalState: GlobalStateService
  ) {
    this._globalState.onLecturesLoaded.subscribe(async () => {
      await this.refreshDownloadLinks();

      this.downloadsStatusChecker =
        this._downloadsService.downloadsStatusChecker$.subscribe(
          async (data) => {
            this.refreshDownloadStatuses(data);

            await this.refreshDownloadLinks();
          }
        );
    });
  }

  async ngOnInit() {
    await this.refreshDownloadLinks();

    this.downloadsStatusChecker =
      this._downloadsService.downloadsStatusChecker$.subscribe(async (data) => {
        this.refreshDownloadStatuses(data);

        await this.refreshDownloadLinks();
      });
  }

  ngOnDestroy() {
    this.downloadsStatusChecker.unsubscribe();
  }

  private async refreshDownloadLinks() {
    this.data = await this._downloadsService.getDownloadsLinksFromFB();
  }

  private refreshDownloadStatuses(links: IDownloadsItem[]) {
    const downloadStatuses: boolean[] = [];

    this._downloadsService.clearDownloadsStatusStorage();

    links.forEach((item: IDownloadsItem) => {
      item.status === "PENDING"
        ? downloadStatuses.push(false)
        : downloadStatuses.push(true);
    });

    this._downloadsService.pushStatusInStorage(downloadStatuses);
  }
}
