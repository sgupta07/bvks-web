import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { environment } from "src/environments/environment";
import { IAPIResponse } from "../models/api-response";
import {
  EditChangeRequestStatusEnum,
  ICreateEditBody,
  IEditsResponse,
} from "../models/edits";

@Injectable({
  providedIn: "root",
})
export class EditsService {
  constructor(private http: HttpClient, private toaster: ToastrService) {}

  public getEdits({
    take,
    skip,
    status,
  }: {
    take: number;
    skip: number;
    status: EditChangeRequestStatusEnum;
  }) {
    return this.getEditsRequest(take, skip, status).toPromise();
  }

  public getTranscriptionById(
    transcriptionId: string,
    { skip, take }: { skip: number; take: number }
  ) {
    return this.getTranscriptionByIdRequest(transcriptionId, {
      skip,
      take,
    }).toPromise();
  }

  public createEdit(body: ICreateEditBody) {
    return this.createEditRequest(body).toPromise();
  }

  public approveEdit(editId: string) {
    return this.approveEditRequest(editId).toPromise();
  }

  public rejectEdit(editId: string) {
    return this.rejectEditRequest(editId).toPromise();
  }

  // --- Requests ---

  private getEditsRequest(
    take: number,
    skip: number,
    status: EditChangeRequestStatusEnum
  ) {
    return this.http.get<IAPIResponse<IEditsResponse>>(
      `${environment.elasticUrl}transcription-change-request`,
      { params: { take: take.toString(), skip: skip.toString(), status } }
    );
  }

  private getTranscriptionByIdRequest(
    transcriptionId: string,
    { skip, take }: { skip: number; take: number }
  ) {
    const params = { skip, take };
    return this.http.get<IAPIResponse<IEditsResponse>>(
      `${environment.elasticUrl}transcription-change-request/${transcriptionId}`,
      {
        params,
      }
    );
  }

  private createEditRequest(body: ICreateEditBody) {
    return this.http.post(
      `${environment.elasticUrl}transcription-change-request`,
      body
    );
  }

  private approveEditRequest(editId: string) {
    return this.http.put(
      `${environment.elasticUrl}transcription-change-request/approve/${editId}`,
      {}
    );
  }

  private rejectEditRequest(editId: string) {
    return this.http.put(
      `${environment.elasticUrl}transcription-change-request/reject/${editId}`,
      {}
    );
  }
}
