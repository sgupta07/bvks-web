import { Component, OnInit } from "@angular/core";

import { GlobalStateService } from "src/app/services/global-state.service";

@Component({
  selector: "app-mobile",
  templateUrl: "./mobile.component.html",
  styleUrls: ["./mobile.component.scss"],
})
export class MobileComponent implements OnInit {
  applicationLink: string;

  constructor(private _globalStateService: GlobalStateService) {}

  ngOnInit(): void {
    if (navigator.userAgent.match(/iPhone/i)) {
      this.applicationLink =
        "https://apps.apple.com/ru/app/bhakti-vikasa-swami/id1536451261?l=en";
    } else {
      this.applicationLink =
        "https://play.google.com/store/apps/details?id=com.iskcon.bvks";
    }
  }

  stayOnTheSite() {
    this._globalStateService.isUserWantToStay = true;
  }
}
