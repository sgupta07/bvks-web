import { Directive, ElementRef, HostListener, Input } from "@angular/core";

import { PaginationService } from "./../services/pagination.service";
import { SearchService } from "./../services/search.service";
import { GlobalStateService } from "src/app/services/global-state.service";

import { ILecture } from "./../models/lecture";

@Directive({
	selector: "[appPagination]",
})
export class PaginationDirective {
	timeout: any;
	allLectures: ILecture[];

	@Input() limit: number;

	@HostListener("scroll") onScroll() {
		clearTimeout(this.timeout);

		this.timeout = setTimeout(() => {
			if (
				this._ref.nativeElement.scrollHeight - window.innerHeight - 250 <
				this._ref.nativeElement.scrollTop
			) {
				this._paginationService.pageIndex += 1;
				this._globalState.onPageIndexChanged.emit(
					this._paginationService.pageIndex
				);
			}
		}, 350);
	}

	constructor(
		private _ref: ElementRef,
		private _paginationService: PaginationService,
		private _globalState: GlobalStateService
	) {
		this._globalState.onFilterChanged.subscribe(() => {
			this._paginationService.pageIndex = 1;
		});

		this._globalState.onSortChanged.subscribe(() => {
			this._paginationService.pageIndex = 1;
		});
	}

	ngOnInit() {
		if ((this._paginationService.pageIndex = 1)) {
			this._ref.nativeElement.scrollTop = 0;
		}
	}
}
