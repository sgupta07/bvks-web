import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class NavigateBackService {
  public oldPath = "/dashboard/categories";
  public videoMode = false;

  constructor(private _router: Router) {}

  navigateBack() {
    this._router.navigate([this.oldPath]);
  }
}
