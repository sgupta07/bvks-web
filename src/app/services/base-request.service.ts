import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { IAPIResponse } from "./../models/api-response";

import { environment } from "./../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class BaseRequestService {
  constructor(public http: HttpClient) {}

  get<T>(url: string, headersObj: any, useDataWrapper = true): Promise<T> {
    return this.request(url, "GET", headersObj, null, useDataWrapper);
  }

  post<T>(url: string, data: any, useDataWrapper = true): Promise<T> {
    return this.request(url, "POST", null, data, useDataWrapper);
  }

  delete<T>(url: string, headersObj: any, useDataWrapper = false): Promise<T> {
    return this.request(url, "DELETE", headersObj, null, useDataWrapper);
  }

  patch<T>(
    url: string,
    data: any,
    useDataWrapper = true,
    headersObj?: any
  ): Promise<T> {
    return this.request(url, "PATCH", null, data, useDataWrapper);
  }

  private async request<T>(
    url: string,
    method: "GET" | "POST" | "DELETE" | "PATCH",
    headersObj: any = {},
    data: any = null,
    useDataWrapper = true
  ): Promise<T> {
    let body;

    const headers = {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}` || "",
      ...headersObj,
    };
    if (data) {
      headers["Content-Type"] = "application/json";
      body = data;
    }
    try {
      if (useDataWrapper) {
        const response = await this.http
          .request<IAPIResponse<T>>(method, environment.serverUrl + url, {
            headers,
            body,
          })
          .toPromise();
        return response.data;
      } else {
        const response = await this.http
          .request<T>(method, environment.serverUrl + url, {
            headers,
            body,
          })
          .toPromise();

        return response;
      }
    } catch (e) {
      const errorObject = e as HttpErrorResponse;
      const errorData = errorObject.error as IAPIResponse<any>;
      if (
        errorData != null &&
        errorData.errorMessage != null &&
        errorData.errorMessage !== ""
      ) {
        alert(errorData);
      } else {
      }

      throw e;
    }
  }
}
