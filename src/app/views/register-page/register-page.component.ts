import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { AuthorizationService } from "./../../services/authorization.service";

@Component({
  selector: "app-register-page",
  templateUrl: "./register-page.component.html",
  styleUrls: ["./register-page.component.scss"],
})
export class RegisterPageComponent implements OnInit {
  constructor(
    protected _authorizationService: AuthorizationService,
    private _router: Router
  ) {}

  form!: FormGroup;

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl("", [Validators.required, Validators.minLength(2)]),
      surname: new FormControl("", [
        Validators.required,
        Validators.minLength(2),
      ]),
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(6),
      ]),
      passwordConfirm: new FormControl("", [
        Validators.required,
        Validators.minLength(6),
      ]),
    });

    if (this._authorizationService.isAuthorized) {
      this._router.navigate(["/dashboard/categories"]);
    }
  }

  async signUp(email: string, password: string) {
    await this._authorizationService.signUp(email, password);

    this.checkingUserAuthorization();
  }

  checkingUserAuthorization() {
    if (this._authorizationService.isAuthorized) {
      this._router.navigate(["/dashboard/categories"]);
    }
  }
}
