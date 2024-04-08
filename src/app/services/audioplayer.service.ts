import { EventEmitter, Injectable } from "@angular/core";
import { IPlayerPlaylistSources } from "src/app/models/player";
import { ILecture } from "../models/lecture";
import { generateAudioPlaylist } from "../utils/player-helpers";

@Injectable({
  providedIn: "root",
})
export class AudioplayerService {
  onDataSetup = new EventEmitter<IPlayerPlaylistSources>();
  onPlayerClose = new EventEmitter();

  constructor() {}

  setData(data: ILecture[], startPosition: number, startTime?: number) {
    const playList = generateAudioPlaylist(data);
    this.onDataSetup.emit({ data: playList, startPosition, startTime });
  }

  closePlayer() {
    this.onPlayerClose.emit(null);
  }
}
