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
export class AuthGuard implements CanActivate {
  constructor(
    protected _authorizationService: AuthorizationService,
    private _router: Router
  ) {}
  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    if (await this._authorizationService.isUserLogged()) {
      return true;
    } else {
      return this._router.parseUrl("/login");
    }
  }
}
