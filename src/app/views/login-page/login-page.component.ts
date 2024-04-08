import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";

import { AuthorizationService } from "./../../services/authorization.service";

@Component({
  selector: "app-login-page",
  templateUrl: "./login-page.component.html",
  styleUrls: ["./login-page.component.scss"],
})
export class LoginPageComponent implements OnInit {
  form!: FormGroup;

  constructor(
    protected _authorizationService: AuthorizationService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    if (this._authorizationService.isAuthorized) {
      this._router.navigate(["/dashboard"]);
    }

    this.form = new FormGroup({
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(6),
      ]),
    });

    if (this._authorizationService.isAuthorized) {
      this._router.navigate(["/dashboard/categories"]);
    }
  }

  async signIn(email: string, password: string) {
    const response: any = await this._authorizationService.signInWithEmail(
      email,
      password
    );

    this.checkUserAuthorization(response);
  }

  checkUserAuthorization(response: any) {
    if (this._authorizationService.isAuthorized) {
      this._router.navigate(["/dashboard/categories"]);

      return;
    }

    alert("Wrong login or password");
  }

  async signInWithGoogle() {
    await this._authorizationService.signInWithGoogle();
    this._router.navigate(["/dashboard/categories"]);
  }

  async signInWithAnyProvider(prov: "google" | "facebook" | "apple") {
    await this._authorizationService.signInWithAnyProvider(prov);
    this._router.navigate(["/dashboard/categories"]);
  }
}
