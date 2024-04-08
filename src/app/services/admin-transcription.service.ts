import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { AdminService } from "./admin.service";

@Injectable({
  providedIn: "root",
})
export class AdminTranscriptionService {
  constructor(
    private http: HttpClient,
    private readonly _adminService: AdminService
  ) {}

  searchTranscriptionById(id: number) {
    return this.http.get<any>(`${environment.elasticUrl}transcription/${id}`);
  }

  changeTranscription(body: {
    transcriptionId: number;
    transcriptions: string[];
  }) {
    const token = this._adminService.getAdminLSTokens()?.accessToken;
    return this.http.put<any>(`${environment.elasticUrl}transcription`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  createTranscription(body: {
    transcriptionId: number;
    transcriptions: string[];
  }) {
    const token = this._adminService.getAdminLSTokens()?.accessToken;
    return this.http.post<any>(`${environment.elasticUrl}transcription`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
