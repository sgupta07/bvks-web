import { IPlaylist } from "./../../../../models/user";
import { ModalService } from "./../../../../services/modal.service";
import { FormArray, Validators } from "@angular/forms";
import { FormControl } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { TuiDialogContext } from "@taiga-ui/core";
import { PlaylistsService } from "src/app/services/playlists.service";
import { MultiSelectService } from "src/app/services/multi-select.service";

@Component({
  selector: "app-add-to-playlist",
  templateUrl: "./add-to-playlist.component.html",
  styleUrls: ["./add-to-playlist.component.scss"],
})
export class AddToPlaylistComponent implements OnInit, OnDestroy {
  playlists: IPlaylist[] = [];
  lectureDataForPlaylist: number[];
  searchRequest = "";
  form: FormGroup;
  onSearchChange = new EventEmitter();

  get playlistsToAdd(): IPlaylist[] {
    return this._playlistsService.playlistsToAdd;
  }

  constructor(
    private _playlistsService: PlaylistsService,
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean>,
    private _modalService: ModalService,
    private _multiselectService: MultiSelectService
  ) {}

  ngOnInit(): void {
    this.playlists = this._playlistsService.myPlaylists;
    this.form = new FormGroup({
      playlistTitle: new FormControl(""),
    });
    this.lectureDataForPlaylist =
      this._modalService.getLectureDataForPlaylist();
  }

  ngOnDestroy(): void {
    this._playlistsService.setPlaylistToAdd = [];
  }

  addToPlaylist() {
    this._playlistsService.addLectureToPlaylist(this.lectureDataForPlaylist);
    this.closeModal();
    this._multiselectService.unchooseAll();
    this._modalService.setLectureDataForPlaylist([]);
  }

  closeModal() {
    this.context.completeWith(false);
  }
  showCreateDialog() {
    this._modalService.showCreatePlaylistDialog();
    this.closeModal();
  }

  searchPlaylists() {
    const trimmedSearchRequest = this.searchRequest.toLowerCase().trim();
    this.playlists = this._playlistsService.myPlaylists.filter(x => {
      if (x.title) {
        const isSubstringOfTitle = x.title
          .trim()
          .toLowerCase()
          .includes(trimmedSearchRequest);
        return isSubstringOfTitle;
      }
    });
  }
}
