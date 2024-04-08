import { Injectable, Pipe, PipeTransform } from "@angular/core";
import { MultiSelectService } from "../services/multi-select.service";

@Pipe({
  name: "searchFilter",
})
@Injectable({
  providedIn: "root",
})
export class SearchFilterPipe implements PipeTransform {
  constructor(private _multiselectService: MultiSelectService) {}
  transform(data: any[], searchData: string): any[] {
    if (!searchData?.trim()) {
      return data;
    }

    const result = data?.filter((post: any) => {
      return (
        post.title
          ?.join(" ")
          .trim()
          .toLowerCase()
          .includes(searchData.trim().toLowerCase()) ||
        post.search.advanced[0]?.toLowerCase().trim() ===
          searchData.toLowerCase().trim()
      );
    });
    this._multiselectService.searchSelectTrigger(true);
    this._multiselectService.setSelectAllLectures(result);

    return result;
  }
}
