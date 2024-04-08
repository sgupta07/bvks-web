export enum EditChangeRequestStatusEnum {
  created = 0,
  approved = 1,
  rejected = 2,
}

export interface IEdit {
  arrayId: number;
  id: number;
  newText: string;
  oldText: string;
  startTextIndex: number;
  status: EditChangeRequestStatusEnum;
  transcriptionId: number;
  createdAt: string;
}

export interface IEditsResponse {
  items: IEdit[];
  totalItems: number;
}

export interface ICreateEditBody {
  transcriptionId: number;
  startTextIndex: number;
  endTextIndex: number;
  oldText: string;
  newText: string;
}
