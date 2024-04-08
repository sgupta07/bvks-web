import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { AdminService } from "../services/admin.service";

@Injectable()
export class AdminTokenInterceptor implements HttpInterceptor {
  private readonly _adminUrls: string[];
  private readonly _tokenHeader = "Authorization";
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  constructor(
    private readonly _httpClient: HttpClient,
    private readonly _adminService: AdminService,
    private readonly _routes: Router
  ) {
    this._adminUrls = [`${environment.elasticUrl}transcription-change-request`];
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<Object>> {
    let authReq = req;
    const token = this._adminService.getAdminLSTokens()?.accessToken;
    const isAdminUrl = !!this._adminUrls.find(url => req.url.includes(url));

    if (token != null && isAdminUrl) {
      authReq = this.addTokenHeader(req, token);
    } else {
      return next.handle(req);
    }

    return next.handle(authReq).pipe(
      catchError(error => {
        if (
          error instanceof HttpErrorResponse &&
          !authReq.url.includes("auth/signIn") &&
          error.status === 401
        ) {
          return this.handle401Error(authReq, next);
        }

        return throwError(error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const token = this._adminService.getAdminLSTokens()?.refreshToken;

      if (token)
        return this._adminService.refreshTokenRequest(token).pipe(
          switchMap((tokens: any) => {
            this.isRefreshing = false;

            this._adminService.setAdminLSTokens(tokens);
            this.refreshTokenSubject.next(tokens.accessToken);

            return next.handle(
              this.addTokenHeader(request, tokens.accessToken)
            );
          }),
          catchError(err => {
            this.isRefreshing = false;

            this._adminService.adminLogout();
            return throwError(err);
          })
        );
    }
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({
      headers: request.headers.set(this._tokenHeader, `Bearer ${token}`),
    });
  }
}

export const adminTokenInterceptorProviders = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AdminTokenInterceptor,
    multi: true,
  },
];
