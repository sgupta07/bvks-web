import { Injectable, EventEmitter } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  isMenuActive: boolean = true;

  onSearchFieldPlaceholderChange = new EventEmitter<string>();

  toggleSidebar(status: boolean) {
    this.isMenuActive = status;
  }
}
