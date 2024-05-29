import { Component, Inject, OnInit } from "@angular/core";
import { TuiSvgService } from "@taiga-ui/core";
import { DashboardService } from "./../../services/dashboard.service";
import { trigger, state, style, animate, transition } from '@angular/animations';


import { ISidebarLink } from "./../../models/sidebar-link";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  sidebarLinksGroup1: ISidebarLink[] = [
    {
      iconPath: "./../../../assets/img/sprite.svg#media",
      text: "Media Library",
      link: "/dashboard/categories",
    },
    {
      iconPath: "tuiIconStarLarge",
      text: "Popular",
      link: "/dashboard/top",
    },
    {
      iconPath: "./../../../assets/img/sprite.svg#playlists",
      text: "Playlists",
      link: "/dashboard/playlists",
    },
    {
      iconPath: "tuiIconHeartLarge",
      text: "Favorites",
      link: "/dashboard/favorites",
    },
    {
      iconPath: "./../../../assets/img/sprite.svg#history",
      text: "History",
      link: "/dashboard/history",
    },
    {
      iconPath: "./../../../assets/img/sprite.svg#statistic",
      text: "Statistics",
      link: "/dashboard/statistics",
    },
    {
      iconPath: "tuiIconDownloadLarge",
      text: "Downloads",
      link: "/dashboard/downloads",
    },
  ];

  sidebarLinksGroup2: ISidebarLink[] = [
    {
      iconPath: "./../../../assets/img/sprite.svg#book2",
      text: "Knowledge Base",
      link: "/dashboard/text",
    },
    {
      iconPath: "./../../../assets/img/sprite.svg#about",
      text: "About",
      link: "/dashboard/about",
    },
    {
      iconPath: "./../../../assets/img/sprite.svg#donate",
      text: "Donate",
      link: "/dashboard/donate",
    },
    {
      iconPath: "tuiIconSettingsLarge",
      text: "Settings",
      link: "/dashboard/settings",
    },
  ];

  isSubMenuActive: boolean = false;

  get isMenuActive(): boolean {
    return this._dashboardService.isMenuActive;
  }

  constructor(
    @Inject(TuiSvgService) svgService: TuiSvgService,
    private _dashboardService: DashboardService
  ) {}

  ngOnInit(): void {}

  toggleSubMenu(): void {
    this.isSubMenuActive = !this.isSubMenuActive;
  }
}
