import { Component } from "@angular/core";
import { Form, FormControl, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AdminService } from "src/app/services/admin.service";

@Component({
  selector: "app-admin-login",
  templateUrl: "./admin-login.component.html",
  styleUrls: ["./admin-login.component.scss"],
})
export class AdminLoginComponent {
  loginForm: FormGroup = new FormGroup({});

  constructor(
    private readonly _router: Router,
    private readonly _adminService: AdminService
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [
        Validators.required,
        Validators.minLength(6),
      ]),
    });

    this._adminService.onAdminSignIn.subscribe(() => {
      this._router.navigateByUrl("/admin");
    });
  }

  public onLogin() {
    this._adminService.adminSignIn(
      this.loginForm.value.email,
      this.loginForm.value.password
    );
  }
}
