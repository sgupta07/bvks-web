import { IShortUrlData } from "./../models/short-url-data";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { take } from "rxjs/operators";

import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";
import { TuiNotification, TuiNotificationsService } from "@taiga-ui/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ShareService {
  constructor(
    private _notificationService: TuiNotificationsService,
    private _httpClient: HttpClient
  ) {}

  async copyLinkToClipboard(
    lectureId: number,
    progress: number,
    lectureHasVideo: boolean
  ) {
    const successText = "Link copied to clipboard";
    const errorText = "Copy this link";

    const link = await this.generateShareLink(
      lectureId,
      progress,
      lectureHasVideo
    );

    try {
      await navigator.clipboard.writeText(link);

      this.showNotification(successText, TuiNotification.Success);
    } catch {
      this.showNotification(link, TuiNotification.Success);
    }
  }

  private showNotification(text: string, status: TuiNotification) {
    this._notificationService
      .show(new PolymorpheusComponent(null), {
        label: text,
        status: status,
      })
      .pipe(take(1))
      .subscribe();
  }

  private async generateShareLink(
    lectureId: number,
    progress: number,
    lectureHasVideo: boolean
  ): Promise<string> {
    let link: string;
    let cutLink: IShortUrlData;

    if (lectureHasVideo) {
      link = `${
        location.protocol + "//" + location.host
      }/lecture/${lectureId}?start_point=${progress}&videoListType=all&videoListParams=null`;
    } else {
      link = `${
        location.protocol + "//" + location.host
      }/dashboard?start_point=${progress}&lecture_id=${lectureId}`;
    }

    const encodedLink = encodeURIComponent(link);

    try {
      cutLink = await this._httpClient
        .get<IShortUrlData>(environment.cutLinkUrl + encodedLink)
        .toPromise();
    } catch {}

    return cutLink ? cutLink.shorturl : link;
  }
}
