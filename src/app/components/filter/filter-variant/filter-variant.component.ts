import { ChangeDetectorRef, Component, Input, OnInit } from "@angular/core";

import { FilterService } from "./../../../services/filter.service";

@Component({
  selector: "app-filter-variant",
  templateUrl: "./filter-variant.component.html",
  styleUrls: ["./filter-variant.component.scss"],
})
export class FilterVariantComponent implements OnInit {
  @Input() variant: string = "";
  @Input() activeTab: any = "languages";

  checkBoxValue = false;

  isFilterVariantActive: boolean;

  constructor(private _filterService: FilterService) {}

  ngOnInit(): void {
    this.isFilterVariantActive = this._filterService.isVariantActive(
      this.activeTab.toLowerCase(),
      this.variant
    );

    this._filterService.onFilterClear.subscribe(() => {
      this.isFilterVariantActive = false;
    });
  }

  toggleActiveFilter() {
    this._filterService.toggleActiveFilter(
      this.activeTab.toLowerCase(),
      this.variant
    );
  }
}
