export interface IShortUrlData {
  shorturl: string;
}

export enum IUrlWithoutSearch {
  POPULAR = "top",
  PLAYLISTS = "playlists",
  FAVORITES = "favorites",
  HISTORY = "history",
  CATEGORIES = "categories",
}
