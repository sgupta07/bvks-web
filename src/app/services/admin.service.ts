import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { IAPIResponse } from "../models/api-response";
import { ITokens } from "../models/tokens";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private _lsKey = "bvks-admin-token";
  public isAdminAuthorized: boolean = false;

  public onAdminSignIn = new EventEmitter<void>();

  constructor(private http: HttpClient) {}

  public adminSignIn(email: string, password: string) {
    return this.signInRequest(email, password).subscribe({
      next: response => {
        this.setAdminLSTokens(response.data);
        this.isAdminAuthorized = true;
        this.onAdminSignIn.emit();
      },
    });
  }

  public adminLogout() {
    this.isAdminAuthorized = false;
    this.clearAdminLSTokens();
  }

  public getIsAdminAuthorized() {
    if (this.getAdminLSTokens()?.accessToken) {
      this.isAdminAuthorized = true;
    }
    return this.isAdminAuthorized;
  }

  private signInRequest(email: string, password: string) {
    return this.http.post<IAPIResponse<ITokens>>(
      `${environment.elasticUrl}auth/signIn`,
      {
        email,
        password,
      }
    );
  }

  public refreshTokenRequest(refreshToken: string) {
    return this.http.post<IAPIResponse<ITokens>>(
      `${environment.elasticUrl}auth/refresh`,
      { refreshToken }
    );
  }

  public getAdminLSTokens(): ITokens | null {
    return JSON.parse(localStorage.getItem(this._lsKey) || "{}");
  }

  public setAdminLSTokens(data: ITokens) {
    localStorage.setItem(this._lsKey, JSON.stringify(data));
  }

  public clearAdminLSTokens() {
    localStorage.removeItem(this._lsKey);
  }
}
