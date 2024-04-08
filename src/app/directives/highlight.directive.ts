import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  Renderer2,
  SimpleChanges,
} from "@angular/core";
import {
  BOOLEAN_REGEX,
  BOOSTING_REGEX,
  PHRASE_REGEX,
  PLUS_REGEX,
  PROXIMITY_REGEX,
  SPECIAL_SYMBOLS,
} from "../constants/search-regex-patterns.constant";

@Directive({
  selector: "[appHighlight]",
})
export class HighlightDirective implements OnChanges {
  @Input() search: string;
  @Input() text: string;
  @Input() isScrollTo = true;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.search || changes.text) {
      this.highlight();
    }
  }

  private highlight(): void {
    if (this.search && this.text) {
      const regex = this.createRegex(this.search);

      const replacedText = this.text.replace(
        regex,
        match => `<span class="highlight">${match}</span>`
      );
      let truncatedText = replacedText;
      if (!this.isScrollTo) {
        truncatedText = this.truncateText(replacedText, 150);
      }

      this.renderer.setProperty(
        this.el.nativeElement,
        "innerHTML",
        truncatedText
      );

      if (this.isScrollTo) {
        this.scrollIntoView();
      }
    } else {
      this.renderer.setProperty(
        this.el.nativeElement,
        "textContent",
        this.text
      );
    }
  }

  private createRegex(search: string): RegExp {
    const phraseMatch = search.match(PHRASE_REGEX);
    const proximityMatch = search.match(PROXIMITY_REGEX);
    const matchBoostSearch = search.match(BOOSTING_REGEX);
    const booleanMatch = search.match(BOOLEAN_REGEX);
    const plusMatch = search.match(PLUS_REGEX);
    if (phraseMatch) {
      console.log("phraseMatch", phraseMatch);

      return new RegExp(`${phraseMatch[1]}`, "gi");
    } else if (proximityMatch) {
      console.log("proximityMatch", proximityMatch);
      const search1 = proximityMatch[1];
      const search2 = proximityMatch[2];
      const index = Number(proximityMatch[3]);

      // const regex = new RegExp(
      //   `(${search1}(?:\\s+\\S+){0,${index}}\\s+${search2})|(${search2}(?:\\s+\\S+){0,${index}}\\s+${search1})`,
      //   "giU"
      // );
      const regex = new RegExp(
        `${search1}${SPECIAL_SYMBOLS}(?:\\s+\\S+){0,${index}}\\s+${SPECIAL_SYMBOLS}${search2}|${search2}${SPECIAL_SYMBOLS}(?:\\s+\\S+){0,${index}}\\s+${SPECIAL_SYMBOLS}${search1}`,
        "gi"
      );
      console.log("regex", regex);

      return regex;
    } else if (
      matchBoostSearch &&
      search.match(new RegExp(/\^/, "gi")) &&
      !search.match(new RegExp(/(AND|OR|NOT|\+)/, "gi"))
    ) {
      console.log("matchBoostSearch", matchBoostSearch);
      let boostSearchStr;
      let search;
      if (matchBoostSearch[3]) {
        boostSearchStr = matchBoostSearch[2] || matchBoostSearch[1];
        search = matchBoostSearch[5] || matchBoostSearch[4];
      } else if (matchBoostSearch[6]) {
        boostSearchStr = matchBoostSearch[4] || matchBoostSearch[5];
        search = matchBoostSearch[2] || matchBoostSearch[1];
      }

      return new RegExp(`${boostSearchStr}|${search}`, "gi");
    } else if (booleanMatch && !search.includes("^") && !search.includes("+")) {
      console.log("booleanMatch", booleanMatch);

      const [, search1, search2, operator, boolSearch1, boolSearch2] =
        booleanMatch;
      const search = search1 || search2;
      const boolSearch = boolSearch1 || boolSearch2;
      return new RegExp(`${search}|${operator !== "NOT" && boolSearch}`, "gi");
    } else if (plusMatch) {
      const [, operator1, search1, search2, operator2, search3, search4] =
        plusMatch;
      const search = search1 || search2;
      const plusSearch = search3 || search4;
      console.log("plusMatch", plusMatch);
      return new RegExp(`${plusSearch}|${search}`, "gi");
    } else {
      // Handle regular search logic here
      const searchNew =
        "\\b" + search.replace("?", ".?").replace("*", "\\w+") + "\\b";
      return new RegExp(searchNew, "gi");
    }
  }

  private truncateText(text: string, maxLength: number): string {
    const spanIndex = text.indexOf('<span class="highlight">');
    if (spanIndex !== -1) {
      let prefix = text.substring(0, spanIndex);
      if (prefix.length > 250) {
        prefix = `...${prefix.slice(spanIndex - 240)}`;
      }
      const highlightedText = text.substring(spanIndex);

      const suffix =
        highlightedText.length <= maxLength
          ? highlightedText
          : highlightedText.substring(0, maxLength) + "...";

      return `${prefix}${suffix}`;
    }
    return `${text.substring(0, 250)}...`;
  }

  private scrollIntoView(): void {
    const highlightedElement =
      this.el.nativeElement.querySelector(".highlight");
    if (highlightedElement) {
      highlightedElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }
}
