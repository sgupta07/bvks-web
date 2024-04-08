import { EventEmitter } from "@angular/core";
import { Component, OnInit, Output } from "@angular/core";

@Component({
  selector: "app-thank-you-popup",
  templateUrl: "./thank-you-popup.component.html",
  styleUrls: ["./thank-you-popup.component.scss"],
})
export class ThankYouPopupComponent implements OnInit {
  @Output() onClose = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {}

  closePopup() {
    this.onClose.emit();
  }
}
