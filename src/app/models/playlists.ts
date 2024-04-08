import { PlaylistType } from "./enums/Playlists";
export enum searchModes {
  LECTURES = "lectures",
  PLAYLISTS = "playlists",
}
export enum showPlaylistsType {
  PRIVATE = "Private",
  MYPUBLIC = "My Public",
  ALL = "All",
  ALLPUBLIC = "All Public",
  FAVORITES = "Favorites",
  RECOMMENDED = "Recommended",
}
export interface editPlaylist {
  title: string;
  listType: PlaylistType;
  lecturesCategory: string;
  discription: string;
  listID: string;
}

export enum sortPlaylistType {
  DEFAULT = "Default View",
  ALPHABETICALLY = "Alphabetically (A-Z)",
  ALPHABETICALLYREVERSE = "Alphabetically (Z-A)",
}

export enum searchTypes {
  DEFAULT = "default",
  DEEP = "deep",
}
