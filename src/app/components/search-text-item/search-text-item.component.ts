import { Component, Input } from "@angular/core";
import { ILecture } from "src/app/models/lecture";
import { LecturesService } from "src/app/services/lectures.service";

interface TextType {
  id: number;
  title: string;
  transcription: string[];
}

@Component({
  selector: "app-search-text-item",
  templateUrl: "./search-text-item.component.html",
  styleUrls: ["./search-text-item.component.scss"],
})
export class SearchTextItemComponent  {
  @Input() data: TextType;
  @Input() search: string;
  title = "";
  constructor(private _lecturesService: LecturesService) {}
  async ngOnInit() {
    let lecture = this._lecturesService.allLectures.find(
      (lecture: ILecture) => lecture.id === this.data.id
    );
    if (!lecture) {
      lecture = (await this._lecturesService.getLectureByIdFromFirebase(
        this.data.id
      )) as any;
    }
    this.title = lecture.title.join('');
  }
}
