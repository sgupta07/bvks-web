export interface IAPIResponse<T> {
  data?: T;
  message?: string[];
  errorMessage?: string;
  status: any;
}
