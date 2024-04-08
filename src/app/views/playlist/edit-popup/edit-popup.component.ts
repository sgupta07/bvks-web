import { IPlaylist } from "src/app/models/user";
import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";
import { TuiDialogContext } from "@taiga-ui/core";
import { PlaylistsService } from "src/app/services/playlists.service";

@Component({
  selector: "app-edit-popup",
  templateUrl: "./edit-popup.component.html",
  styleUrls: ["./edit-popup.component.scss"],
})
export class EditPopupComponent implements OnInit {
  form: FormGroup;
  playlistInfo: IPlaylist;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean>,
    private _playlistService: PlaylistsService
  ) {
    this.playlistInfo = context.data;
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl(this.playlistInfo.title, [Validators.required]),
      lecturesCategory: new FormControl(this.playlistInfo.lecturesCategory, [
        Validators.required,
      ]),
      discription: new FormControl(this.playlistInfo.discription, [
        Validators.required,
      ]),
      listType: new FormControl(this.playlistInfo.listType, [
        Validators.required,
      ]),
    });
  }

  editPlaylist() {
    const newPlaylistInfo = {
      title: this.form.value.title,
      lecturesCategory: this.form.value.lecturesCategory,
      discription: this.form.value.discription,
      listType: this.form.value.listType,
      listID: this.playlistInfo.listID,
    };
    this._playlistService.editPlaylist(newPlaylistInfo);
    this.closeModal();
  }

  closeModal() {
    this.context.completeWith(false);
  }
}
