export interface ITopLecture {
  audioPlayedTime: number;
  createdDay: {
    day: number;
    month: number;
    year: number;
  };
  creationTimestamp: number;
  documentId: string;
  documentPath: string;
  lastModifiedTimestamp: number;
  playedBy: string[];
  playedIds: number[];
  videoPlayedTime: number;
}
