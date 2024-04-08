import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class DownloadFileService {
  constructor() {}

  downloadFile(text: string, filename: string, contentType: string) {
    const blob = new Blob([text], { type: contentType });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
