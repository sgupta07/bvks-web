import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import {
  BOOLEAN_REGEX,
  BOOSTING_REGEX,
  PHRASE_REGEX,
  PLUS_REGEX,
  PROXIMITY_REGEX,
} from "../constants/search-regex-patterns.constant";

export interface IDeepSearchResponse {
  data: IDeepSearchItem[];
}
interface IDeepSearchItem {
  id: number;
  count: number;
}

enum SearchBooleanEnum {
  OR = "should",
  AND = "filter",
  NOT = "must_not",
}

@Injectable({
  providedIn: "root",
})
export class DeepSearchService {
  constructor(private http: HttpClient) {}

  search(searchString: string) {
    if (searchString.trim().length === 0) {
      return;
    }
    return this.http.get<IDeepSearchResponse>(
      `${environment.elasticUrl}transcription/search/phrase`,
      {
        params: { search: searchString },
      }
    );
  }
  searchTranscriptions(searchString: string) {
    if (searchString.trim().length === 0) {
      return;
    }
    const params = this.parsedSearchStringParams(searchString);
    if (params.default) {
      return this.http.get<IDeepSearchResponse>(
        `${environment.elasticUrl}transcription/search/wildcard`,
        {
          params: { search: searchString },
        }
      );
    } else {
      return this.http.get<IDeepSearchResponse>(
        `${environment.elasticUrl}transcription/search/phrase`,
        {
          params,
        }
      );
    }
  }
  searchTranscriptionById(id: number) {
    return this.http.get<any>(`${environment.elasticUrl}transcription/${id}`);
  }

  // search | proximity | boost | bool search handlers
  parsedSearchStringParams(searchString: string): any | null {
    // Regular expression to match the pattern "search string"
    const matchPhraseSearch = searchString.match(PHRASE_REGEX);

    // Regular expression to match the pattern "search string"~number
    const matchProximitySearch = searchString.match(PROXIMITY_REGEX);

    // Regular expression to match the pattern "search^{number} string"
    const matchBoostSearch = searchString.match(BOOSTING_REGEX);

    // Regular expression to match the pattern "search AND|OR|NOT string"
    const matchBoolSearch = searchString.match(BOOLEAN_REGEX);

    // Regular expression to match the pattern "search AND|OR|NOT string"
    const matchPlusSearch = searchString.match(PLUS_REGEX);

    if (matchPhraseSearch) {
      // console.log("matchPhraseSearch", matchPhraseSearch);

      return { search: matchPhraseSearch[1] };
    } else if (matchProximitySearch) {
      // console.log("matchProximitySearch", matchProximitySearch);
      const search = `${matchProximitySearch[1]} ${matchProximitySearch[2]}`; // Extracting the search string
      const slop = parseInt(matchProximitySearch[3]); // Extracting and parsing the slop number
      return { search, slop };
    } else if (
      matchBoolSearch &&
      !searchString.includes("^") &&
      !searchString.includes("+")
    ) {
      // console.log("matchBoolSearch", matchBoolSearch);
      const [, search1, search2, operator, boolSearch1, boolSearch2] =
        matchBoolSearch;
      const search = search1 || search2;
      const boolSearch = boolSearch1 || boolSearch2;
      const boolSearchType =
        SearchBooleanEnum[operator as keyof typeof SearchBooleanEnum] ||
        SearchBooleanEnum.OR;
      const boolSearchParams = {
        search,
        "boolSearch[search]": boolSearch,
        "boolSearch[type]": boolSearchType,
      };

      return boolSearchParams;
    } else if (matchBoostSearch && !searchString.includes("+")) {
      let boostSearchStr;
      let boostSearchValue;
      let search;
      if (matchBoostSearch[3]) {
        boostSearchValue = matchBoostSearch[3];
        boostSearchStr = matchBoostSearch[2] || matchBoostSearch[1];
        search = matchBoostSearch[5] || matchBoostSearch[4];
      } else if (matchBoostSearch[6]) {
        boostSearchStr = matchBoostSearch[4] || matchBoostSearch[5];
        boostSearchValue = matchBoostSearch[6];
        search = matchBoostSearch[2] || matchBoostSearch[1];
      }

      let parsedCoefficient = Number(boostSearchValue);
      parsedCoefficient =
        parsedCoefficient > 1
          ? (100 - Number(boostSearchValue)) / 100
          : parsedCoefficient; // Extracting and parsing the positive coefficient

      const boostSearch = {
        search,
        "boostSearch[search]": boostSearchStr,
        "boostSearch[negativeCoefficient]": parsedCoefficient, // If coefficient > 1, set to null
      };

      return boostSearch;
    } else if (matchPlusSearch) {
      console.log("matchPlusSearch", matchPlusSearch);
      const [, operator1, search1, search2, operator2, search3, search4] =
        matchPlusSearch;
      const search = !operator1 ? search1 || search2 : search3 || search4;
      const plusSearch = operator1 ? search1 || search2 : search3 || search4;
      const plusSearchParams = {
        search: plusSearch,
        "plusSearch[search]": search,
      };
      return plusSearchParams;
    } else {
      return { default: true };
    }
  }
}
