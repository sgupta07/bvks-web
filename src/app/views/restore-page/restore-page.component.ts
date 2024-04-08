import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";

import { AuthorizationService } from "./../../services/authorization.service";

@Component({
  selector: "app-restore-page",
  templateUrl: "./restore-page.component.html",
  styleUrls: ["./restore-page.component.scss"],
})
export class RestorePageComponent implements OnInit {
  constructor(protected _authorizationService: AuthorizationService) { }

  form!: FormGroup;

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl("", [Validators.required, Validators.email]),
    });
  }

  async sendEmailToRestorePassword(email: string): Promise<void> {
    await this._authorizationService.restorePassword(email);

    alert("Request has been sent");
  }
}
