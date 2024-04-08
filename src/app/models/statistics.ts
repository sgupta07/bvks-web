export interface IListenInfo {
  audioListen: number;
  creationTimestamp: number;
  date: string;
  dateOfRecord: IDateOfRecord;
  documentId: string;
  documentPath: string;
  lastModifiedTimestamp: number;
  listenDetails: IListenDetails;
  playedIds: number[];
  videoListen: number;
}

export interface IDateOfRecord {
  day: number;
  month: number;
  year: number;
}

export interface IListenDetails {
  BG: number;
  CC: number;
  SB: number;
  Seminars: number;
  VSN: number;
  others: number;
}

export enum StatisticsPeriods {
  THIS_WEEK = "This week",
  LAST_WEEK = "Last week",
  LAST_MONTH = "Last month",
  CUSTOM = "Custom",
}

export enum CategoryAbbr {
  BG = "BG",
  CC = "CC",
  SB = "SB",
  Seminars = "Seminars",
  VSN = "VSN",
  others = "others",
}

export interface IPeriodStat {
  audio: number;
  video: number;
  SB: number;
  BG: number;
  CC: number;
  VSN: number;
  others: number;
  Seminars: number;
}

export interface ICustomPeriodInfo {
  day: number;
  month: number;
  year: number;
}
