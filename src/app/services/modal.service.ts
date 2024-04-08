import { ILecture } from "./../models/lecture";
import { IPlaylist } from "./../models/user";
import { AddToPlaylistComponent } from "src/app/views/playlists/popups/add-to-playlist/add-to-playlist.component";
import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";
import { EventEmitter, Injectable } from "@angular/core";
import { TuiDialogService } from "@taiga-ui/core";
import { CreatePlaylistComponent } from "../views/playlists/popups/create-playlist/create-playlist.component";

@Injectable({
  providedIn: "root",
})
export class ModalService {
  lectureData: number[];

  getLectureDataForPlaylist() {
    return this.lectureData;
  }

  setLectureDataForPlaylist(value: number[]) {
    this.lectureData = value;
  }

  constructor(private readonly dialogService: TuiDialogService) {}

  private readonly createPlaylistDialog = this.dialogService.open<number>(
    new PolymorpheusComponent(CreatePlaylistComponent),
    {
      data: 237,
      dismissible: true,
      label: "Create new playlist",
      size: "m",
      closeable: false,
    }
  );

  public addToPlaylistDialog = this.dialogService.open<number>(
    new PolymorpheusComponent(AddToPlaylistComponent),
    {
      data: "",
      dismissible: true,
      label: "Add to Playlist",
      size: "s",
      closeable: false,
    }
  );

  async showCreatePlaylistDialog() {
    await this.createPlaylistDialog.toPromise();
  }

  async addToPlaylist(data: number[]) {
    this.lectureData = data;
    await this.addToPlaylistDialog.toPromise();
  }
}
