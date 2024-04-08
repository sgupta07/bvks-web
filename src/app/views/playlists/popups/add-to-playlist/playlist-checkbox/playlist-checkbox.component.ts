import { IPlaylist } from "./../../../../../models/user";
import { Input } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { PlaylistsService } from "src/app/services/playlists.service";

@Component({
  selector: "app-playlist-checkbox",
  templateUrl: "./playlist-checkbox.component.html",
  styleUrls: ["./playlist-checkbox.component.scss"],
})
export class PlaylistCheckboxComponent implements OnInit {
  @Input() playlist: IPlaylist;

  checkBoxValue = false;

  constructor(private _playlistsServcie: PlaylistsService) {}

  ngOnInit(): void {}

  onCheckboxChange() {
    this._playlistsServcie.changePlaylistsToAdd(this.playlist);
  }

  checkPlayListTypeImage(): string {
    const playlistType = this._playlistsServcie.allPlaylists.find(
      (p) => p.listID === this.playlist.listID
    ).listType;
    return playlistType === "Private"
      ? "../../../../../../assets/icons/private.svg"
      : "../../../../../../assets/icons/public.svg";
  }
}
