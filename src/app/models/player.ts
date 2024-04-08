import videojs from "video.js";
import { ILecture } from "./lecture";

export interface IPlayerPlaylistSources {
  startPosition: number;
  data: IPlayerSource[];
  startTime?: number;
}

export interface IPlayerSource {
  name: string;
  sources: videojs.Tech.SourceObject[];
  youtube?: any;
  poster: string;
  thumbnail: [
    {
      src: string;
    }
  ];
  lectureData: ILecture;
}

export interface IPlayerQueryParams {
  videoListType: string;
  videoListParams: string;
  start_point?: number;
}
