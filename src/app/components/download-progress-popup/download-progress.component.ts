import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from "@angular/core";

import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";
import { TuiDialogContext } from "@taiga-ui/core";

import { DownloadsService } from "src/app/services/downloads.service";

@Component({
  selector: "app-download-progress",
  templateUrl: "./download-progress.component.html",
  styleUrls: ["./download-progress.component.scss"],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DownloadProgressComponent implements OnInit {
  downloadProgress: number = 0;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean> | any,
    private _downloadService: DownloadsService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._downloadService.onDownloadProgress.subscribe((event: number) => {
      this.downloadProgress = event;
      this._changeDetectorRef.detectChanges();

      if (event >= 100) {
        this.closeNotification();
      }
    });
  }

  closeNotification() {
    this.context?.closeHook();
  }
}
