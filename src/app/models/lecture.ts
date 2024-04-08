export interface ILecture {
  category: string[];
  creationTimestamp: string;
  dateOfRecording: {
    day: string;
    month: string;
    year: string;
  };
  description: string[];
  id: number;
  language: {
    main: string;
    translations: any;
  };
  lastModifiedTimestamp: string;
  legacyData: {
    lectureCode: string;
    slug: string;
    verse: string;
    wpId: number;
  };
  length: number;
  lengthType: string[];
  location: {
    city: string;
    country: string;
    state: string;
  };
  place: string[];
  resources: {
    audios: any[];
    transcriptions: any[];
    videos: any[];
  };
  search: {
    advanced: any[];
    simple: any[];
  };
  tags: string[];
  thumbnail: string;
  title: string[];
  isSelected?: boolean;
  fbId?: string;

  mentions?: number;
}

export interface IDownloadsItem {
  createdDate: ITimestamp;
  googleId: string;
  lectureName: string;
  status: string;
  url: string;
  userId: string;
}

export interface ITimestamp {
  seconds: number;
  nanoseconds: number;
}

export enum IRepeatTypes {
  "dont-repeat",
  "repeat-once",
  "repeat-alsways",
}

export enum LecturePostMode {
  select,
  play_audio,
  open_lecture_page,
}

export enum FavoritesAction {
  ADD = "ADD",
  DELETE = "DELETE",
}

export enum PlaybackMode {
  AUDIOS = "Audio only (all lectures)",
  VIDEOS = "Only lectures with video",
}
