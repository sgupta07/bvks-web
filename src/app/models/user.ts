import { PlaylistType } from "./enums/Playlists";

export interface IUserLecture {
  android: any;
  creationTimestamp: number;
  documentId: string;
  documentPath: string;
  downloadPlace: number;
  favouritePlace: number;
  id: number;
  ios: any;
  isCompleted: boolean;
  isDownloaded: boolean;
  isFavourite: boolean;
  isInPrivateList: boolean;
  isInPublicList: boolean;
  lastModifiedTimestamp: number;
  lastPlayedPoint: number;
  privateListIDs: number[];
  publicListIDs: number[];
  totalPlayedNo: number;
  totalPlayedTime: number;
  totallength: number;
}

export interface IUser {
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  providerId: string;
  uid: string;
}
export interface IPlaylist {
  authorEmail: string;
  creationTime: number;
  discription: string;
  docPath: string;
  lastUpdate: number;
  lectureCount?: number;
  lectureIds: number[];
  lecturesCategory: string;
  listID?: string;
  listType: PlaylistType;
  thumbnail: string;
  title: string;
}

export interface ICreatePlaylist {
  title: string;
  lecturesCategory: string;
  listType: PlaylistType;
  discription: string;
}
