import { ModalService } from "src/app/services/modal.service";
import { Validators } from "@angular/forms";
import { FormControl } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { TuiDialogContext } from "@taiga-ui/core";
import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";
import { PlaylistsService } from "src/app/services/playlists.service";
import { MultiSelectService } from "src/app/services/multi-select.service";

@Component({
  selector: "app-create-playlist",
  templateUrl: "./create-playlist.component.html",
  styleUrls: ["./create-playlist.component.scss"],
})
export class CreatePlaylistComponent implements OnInit, OnDestroy {
  form: FormGroup;
  lectureIds: number[] = [];
  lectureDataForPlaylist: number[] = [];
  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean>,
    private _playlistsService: PlaylistsService,
    private _multiselectService: MultiSelectService,
    private _modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl("", [Validators.required]),
      lecturesCategory: new FormControl(""),
      discription: new FormControl(""),
      listType: new FormControl("Private"),
    });
    this.lectureIds = this._multiselectService.getSelectedLectures;
    this.lectureDataForPlaylist =
      this._modalService.getLectureDataForPlaylist();
  }

  ngOnDestroy() {
    this._modalService.setLectureDataForPlaylist([]);
  }

  createPlaylist() {
    this.closeModal();
    const playlistLectures = this.lectureDataForPlaylist
      ? this.lectureDataForPlaylist
      : this.lectureIds;
    this._playlistsService.createPlaylist(this.form.value, playlistLectures);
  }

  closeModal() {
    this.context.completeWith(false);
    this._multiselectService.unchooseAll();
  }
}
