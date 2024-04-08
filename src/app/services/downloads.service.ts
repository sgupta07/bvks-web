import { Observable } from "rxjs";
import { EventEmitter, Injectable } from "@angular/core";
import { BaseRequestService } from "./base-request.service";
import {
  HttpClient,
  HttpResponse,
  HttpEventType,
  HttpRequest,
} from "@angular/common/http";
import { AuthorizationService } from "./authorization.service";
import { IUser } from "../models/user";
import { AngularFirestore } from "@angular/fire/firestore";
import { map } from "rxjs/operators";
import { IDownloadsItem, ILecture } from "../models/lecture";
import { FileSaverService } from "ngx-filesaver";
import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";
import { TuiNotification, TuiNotificationsService } from "@taiga-ui/core";

import { DownloadProgressComponent } from "../components/download-progress-popup/download-progress.component";
import { GoToDownloadsComponent } from "../components/go-to-downloads/go-to-downloads.component";

@Injectable({
  providedIn: "root",
})
export class DownloadsService extends BaseRequestService {
  onDownloadProgress = new EventEmitter<number>();

  user: IUser;
  counter: number = 0;
  isActiveDownloads = false;
  downloadsStatusChecker$: Observable<any> = new Observable();

  downloadsStatusStorage: boolean[] = [];

  get allDownloadStatuses(): boolean[] {
    return this.downloadsStatusStorage;
  }

  constructor(
    private _http: HttpClient,
    private _FileSaverService: FileSaverService,
    private _authService: AuthorizationService,
    private _firebase: AngularFirestore,
    private notificationsService: TuiNotificationsService
  ) {
    super(_http);
  }

  getUser() {
    if (!this.user) {
      this.user = this._authService.getUser();
    }
  }

  async donwloadSingleLecture(lectureData: ILecture) {
    if (this.isActiveDownloads) {
      return;
    }

    this.notificationsService
      .show(new PolymorpheusComponent(DownloadProgressComponent), {
        label: "Download progress",
        status: TuiNotification.Info,
        autoClose: false,
      })
      .subscribe();
    // get audio data from url
    const audioData = new HttpRequest(
      "GET",
      lectureData.resources.audios[0].url,
      {
        responseType: "arraybuffer",
        reportProgress: true,
      }
    );

    this.http.request(audioData).subscribe(event => {
      if (event.type === HttpEventType.DownloadProgress) {
        this.isActiveDownloads = true;
        // download progress event. Compute and show the % done:
        const percentDone = Math.round((100 * event.loaded) / event.total);

        this.onDownloadProgress.emit(percentDone);
      } else if (event instanceof HttpResponse) {
        this.isActiveDownloads = false;
        // create blob from data
        let blob = new Blob([event.body as BlobPart], { type: "audio/mp3" });
        // save blob on computer as mp3 file
        this._FileSaverService.save(blob, lectureData.title.join(" "));
      }
    });
  }

  pushStatusInStorage(arr: boolean[]) {
    this.downloadsStatusStorage = arr;
  }

  clearDownloadsStatusStorage() {
    this.downloadsStatusStorage.length = 0;
  }

  async addLecturesToDownloads(lectureIds: number[]) {
    this.getUser();
    try {
      await this.post("/download/", {
        userId: this.user.uid,
        lectureIds,
      });
      this.notificationsService
        .show(new PolymorpheusComponent(GoToDownloadsComponent), {
          label: "Lectures are being zipped. Please go to:",
          status: TuiNotification.Success,
        })
        .subscribe();
    } catch (error) {
      this.notificationsService
        .show("", { label: error, status: TuiNotification.Error })
        .subscribe();
      console.error(error);
    }
  }

  async getDownloadsLinksFromFB() {
    this.getUser();
    if (!this.user) {
      return;
    }

    this.downloadsStatusChecker$ = this._firebase
      .collection<IDownloadsItem>("archives", ref => {
        return ref.where("userId", "==", this.user.uid);
      })
      .valueChanges();

    return await this._firebase
      .collection<IDownloadsItem>("archives", ref => {
        return ref.where("userId", "==", this.user.uid);
      })
      .get()
      .pipe(
        map(snapshot => {
          let items: any[] = [];
          snapshot.docs.map(a => {
            const data = a.data();
            items.push(data);
          });
          return items;
        })
      )
      .toPromise();
  }
}
