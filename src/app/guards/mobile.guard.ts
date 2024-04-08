import { GlobalStateService } from "src/app/services/global-state.service";
import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";

import { AuthorizationService } from "./../services/authorization.service";

@Injectable({
  providedIn: "root",
})
export class MobileGuard implements CanActivate {
  constructor(
    protected _authorizationService: AuthorizationService,
    private _router: Router,
    private _globalStateService: GlobalStateService
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    if (
      navigator.userAgent.match(/Android|Blackberry|iPhone/i) &&
      !this._globalStateService.isUserWantToStay
    ) {
      return this._router.parseUrl("/mobile");
    }

    return true;
  }
}
