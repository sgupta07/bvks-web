import { Component, Input, OnInit } from "@angular/core";
import { LecturesService } from "src/app/services/lectures.service";

interface TextType {
  id: number;
  title: string
  transcription: string[];
}

@Component({
  selector: "app-search-text-item",
  templateUrl: "./search-text-item.component.html",
  styleUrls: ["./search-text-item.component.scss"],
})
export class SearchTextItemComponent implements OnInit {
  @Input() data: TextType;
  @Input() search: string;
  title = "";
  constructor(private _lecturesService: LecturesService) {}

  async ngOnInit() {
   
  }
}
