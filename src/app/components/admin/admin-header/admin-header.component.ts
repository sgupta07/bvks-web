import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AdminService } from "src/app/services/admin.service";

@Component({
  selector: "app-admin-header",
  templateUrl: "./admin-header.component.html",
  styleUrls: ["./admin-header.component.scss"],
})
export class AdminHeader implements OnInit {
  constructor(private adminService: AdminService, private router: Router) {}
  logout() {
    this.adminService.clearAdminLSTokens();
    this.router.navigate(["admin", "login"]);
  }
  ngOnInit(): void {}
}
