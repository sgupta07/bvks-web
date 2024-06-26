import { transition } from "@angular/animations";
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

export interface ISearchResponse {
  data: ISearchItem[];
}
interface ISearchItem {
  id: number;
  transcription: string[];
}

enum SearchBooleanEnum {
  OR = "filter",
  AND = "should",
  NOT = "must_not",
}
export interface ITranscriptionResponse {
  data: {
    transcriptions: {
      id: number;
      count: number;
      transcription: string[];
    }[];
  };
  total: number;
}

interface LectureFilterDto {
  language?: string[];
  country?: string[];
  year?: string[];
  month?: string[];
  place?: string[];
  translation?: string[];
  category?: string[];
}

export interface LectureSortDto {
  "title.keyword"?: "asc" | "desc";
  dateOfRecording?: "asc" | "desc";
  duration?: "asc" | "desc";
}

@Injectable({
  providedIn: "root",
})
export class DeepSearchService {
  constructor(private http: HttpClient) {}

  search(searchString: string, take: number, skip: number) {
    if (searchString.trim().length === 0) {
      return;
    }
    const requestBody: any = { search: searchString };
    let endpoint = `${environment.elasticUrl}transcription/search/phrase`;
    const params = this.parsedSearchStringParams(searchString);
    if (take !== undefined) {
      endpoint += `?take=${take}`;
    }
    if (skip !== undefined && skip >= 0) {
      const separator = endpoint.includes("?") ? "&" : "?";
      endpoint += `${separator}skip=${skip}`;
    }
    return this.http.post<ITranscriptionResponse>(endpoint, requestBody);
  }

  searchTranscriptions(
    searchString: string,
    filters?: LectureFilterDto,
    sort?: LectureSortDto,
    take?: number,
    skip?: number
  ) {
    if (searchString.trim().length === 0) {
      return;
    }
    const requestBody: any = { search: searchString };

    const params = this.parsedSearchStringParams(searchString);
    let endpoint;
    if (!params.default) {
      const nonEmptyFilters: Partial<LectureFilterDto> = {};
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (
            filters[key as keyof LectureFilterDto] &&
            filters[key as keyof LectureFilterDto]!.length > 0
          ) {
            nonEmptyFilters[key as keyof LectureFilterDto] =
              filters[key as keyof LectureFilterDto];
          }
        });
      }
      if (Object.keys(nonEmptyFilters).length > 0) {
        requestBody.filters = nonEmptyFilters;
      }

      if (sort && Object.values(sort).length > 0) {
        requestBody.sort = sort;
      }

      endpoint = `${environment.elasticUrl}transcription/search/phrase`;
    } else {
      const nonEmptyFilters: Partial<LectureFilterDto> = {};
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (
            filters[key as keyof LectureFilterDto] &&
            filters[key as keyof LectureFilterDto]!.length > 0
          ) {
            nonEmptyFilters[key as keyof LectureFilterDto] =
              filters[key as keyof LectureFilterDto];
          }
        });
      }
      if (Object.keys(nonEmptyFilters).length > 0) {
        requestBody.filters = nonEmptyFilters;
      }

      if (sort && Object.values(sort).length > 0) {
        requestBody.sort = sort;
      }

      endpoint = `${environment.elasticUrl}transcription/search/phrase`;
    }
    if (take !== undefined) {
      endpoint += `?take=${take}`;
    }
    if (skip !== undefined && skip >= 0) {
      const separator = endpoint.includes("?") ? "&" : "?";
      endpoint += `${separator}skip=${skip}`;
    }
    if (params.default != true) {
      return this.http.post<ITranscriptionResponse>(endpoint, params);
    } else {
      return this.http.post<ITranscriptionResponse>(endpoint, requestBody);
    }
  }

  searchTranscriptionss(searchString: string) {
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
        boolSearch: {
          search: boolSearch,
          type: boolSearchType,
        },
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
        boostSearch: {
          search: boostSearchStr,
          negativeCoefficient: parsedCoefficient,
        },
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
        plusSearch: {
          search: search,
        },
      };
      return plusSearchParams;
    } else {
      return { default: true };
    }
  }
}
