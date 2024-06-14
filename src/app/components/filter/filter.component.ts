import { FormBuilder, FormControl } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { Component, Input, OnInit, Inject } from "@angular/core";
import { GlobalStateService } from "src/app/services/global-state.service";

import { FilterService } from "./../../services/filter.service";
import { IFilter } from "./../../models/filter";

import { TuiDialogContext } from "@taiga-ui/core";
import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";
import { MultiSelectService } from "src/app/services/multi-select.service";

@Component({
  selector: "app-filter",
  templateUrl: "./filter.component.html",
  styleUrls: ["./filter.component.scss"],
})
export class FilterComponent implements OnInit {
  @Input() isVisible?: boolean;

  tabs: string[] = [
    "language",
    "country",
    "place",
    "year",
    "month",
    "category",
    "translation",
  ];

  activeTab: string = "language";
  activeVariants: string[];
  filterVariants: any = {
    language: ["English", "বাংলা", "हिन्दी"],
    country: [
      "Bangladesh",
      "Canada",
      "Croatia",
      "Czech Republic",
      "Finland",
      "Germany",
      "Hungary",
      "India",
      "Ireland",
      "Poland",
      "Russia",
      "Slovenia",
      "Sri Lanka",
      "Sweden",
      "UK",
      "USA",
    ],
    place: [
      "Ahmedabad, Gujarat",
      "Akkaraipattu, Tamil Nadu",
      "Albuquerque, New Mexico",
      "Ambur, Tamil Nadu",
      "Amona, Goa",
      "Ankleshwar, Gujarat",
      "Bangalore, Karnataka",
      "Baroda/Vadodara, Gujarat",
      "Batticaloa, Sri Lanka",
      "Bhaktivedanta Manor, London",
      "Bharuch, Gujarat",
      "Bhimavaram, Andhra Pradesh",
      "Bhopal, Madhya Pradesh",
      "Bilimora, Gujarat",
      "Brahmanbaria, Bangladesh",
      "Brazina",
      "Cakovec, Croatia",
      "Chattogram, Bangladesh",
      "Chennai, Tamil Nadu",
      "Chicago, Illinois",
      "Chittagong, Bangladesh",
      "Coimbatore, Tamil Nadu",
      "Comilla, Bangladesh",
      "Corvallis, Oregon",
      "Dallas, Texas",
      "Daltonganj, Jharkhand",
      "Delhi",
      "Denver, Colorado",
      "Detroit, Michigan",
      "Dhaka, Bangladesh",
      "Dibrugarh, Assam",
      "Dublin, Ireland",
      "Erode, Tamil Nadu",
      "Gauragrama, Telangana",
      "Goa",
      "Govardhan, Uttar Pradesh",
      "Gurgaon, Delhi",
      "Helsinki, Finland",
      "Hyderabad, Telangana",
      "Jamnagar, Gujarat",
      "Javornik, Czech Republic",
      "Juhu, Maharashtra",
      "Kanchipuram, Tamil Nadu",
      "Karumandurai, Salem, Tamil Nadu",
      "Karwar, Karnataka",
      "Katpadi, Karnataka",
      "Kaveripakkam, Tamil Nadu",
      "Kazan, Tatarstan",
      "Krisna Volgy, Hungary",
      "Laguna Beach, California",
      "Leicester, United Kingdom",
      "Lika, Croatia",
      "Ljubljana, Slovenia",
      "London",
      "Los Angeles, California",
      "Mahuva, Gujarat",
      "Mangalore, Karnataka",
      "Manipal, Karnataka",
      "Mapusa, Goa",
      "Mayapur, West Bengal",
      "Mira Road, Mumbai",
      "Moran, Assam",
      "Moscow",
      "Mumbai, Maharashtra",
      "Muradnagar, Uttar Pradesh",
      "Naberezhnye Chelny, Tatarstan",
      "Namakkal, Tamil Nadu",
      "Nandagrama, Gujarat",
      "Navsari, Gujarat",
      "New York City, New York",
      "Noida, Delhi",
      "Oregon",
      "Pancavati, Tamil Nadu",
      "Perm, Russia",
      "Philadelphia, Pennsylvania",
      "Ponda, Goa",
      "Protivanov, Czech Republic",
      "Pula, Croatia",
      "Pune, Maharashtra",
      "Rajapur, West Bengal",
      "Ranipet, Tamil Nadu",
      "Salem, Tamil Nadu",
      "Sammamish, Washington",
      "San Diego, California",
      "Sant Nagar, Delhi",
      "Saputara, Gujarat",
      "Seattle, Washington",
      "Secunderabad, Telangana",
      "Simhacalam, Andhra Pradesh",
      "Simi Valley, California",
      "Sitakunda, Bangladesh",
      "Sonapur, Assam",
      "Srirangam, Tamil Nadu",
      "St. Louis, Missouri",
      "Stockholm",
      "Surat, Gujarat",
      "Thane, Mumbai",
      "Thirukkovil, Sri Lanka",
      "Tirupati, Andhra Pradesh",
      "Toronto, Ontario",
      "Tula, Russia",
      "Udupi, Karnataka",
      "Ujjain, Madhya Pradesh",
      "Vallabh Vidyanagar, Gujarat",
      "Vellore, Tamil Nadu",
      "Vrindavana, Uttar Pradesh",
    ],
    year: [
      "2024",
      "2023",
      "2022",
      "2021",
      "2020",
      "2019",
      "2018",
      "2017",
      "2016",
      "2015",
      "2014",
      "2013",
      "2012",
      "2011",
      "2010",
      "2009",
      "2008",
      "2007",
      "2006",
      "2005",
      "2004",
      "2003",
      "2002",
      "2001",
      "2000",
      "1999",
      "1998",
      "1997",
      "1996",
      "1995",
      "1994",
      "1993",
    ],
    month: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    category: [
      "ASK BVKS",
      "Assorted Lectures",
      "Bhagavad-gītā",
      "Bhajans",
      "Conversations",
      "Seminars",
      "Śrīmad-Bhāgavatam",
      "Śrī Caitanya-caritāmṛta",
      "Viṣṇu-sahasranāma",
    ],
    translation: [
      "Hrvatski (Croatian)",
      "Portuguese",
      "Slovenščina (Slovenian)",
      "Český (Czech)",
      "Русский (Russian)",
      "हिन्दी (Hindi)",
      "বাংলা (Bengali)",
      "தமிழ் (Tamil)",
      "తెలుగు (Telugu)",
    ],
  };
  selectedFilters: IFilter = {
    language: [],
    country: [],
    place: [],
    year: [],
    month: [],
    category: [],
    translation: [],
  };


  constructor(
    private _globalStateService: GlobalStateService,
    private _filterService: FilterService,
    private _multiselectService: MultiSelectService,

    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean>
  ) {}

  ngOnInit(): void {
    this._filterService.resetLocalActiveFilters();

    this.activeVariants = this.filterVariants.languages;
  }

  selectTab(tab: string) {
    this.activeTab = tab;
    this.activeVariants = this.filterVariants[tab.toLowerCase()];
  }

  closeModal() {
    this._multiselectService.searchSelectTrigger(false);
    this.context.completeWith(false);
  }

  getActiveFiltersCount(type: any): number {
    return this._filterService.getActiveFiltersCount(type.toLowerCase());
  }

  clearActiveFilters() {
    this._filterService.clearActiveFilters();
    this._globalStateService.onFilterApply.emit();
    this._multiselectService.searchSelectTrigger(false);
    this._globalStateService.setSortRequest("Default View");
  }

  transferLocalFiltersToGlobal() {
    this._filterService.transferLocalFiltersToGlobal();
    this._multiselectService.searchSelectTrigger(true);
    this._globalStateService.onFilterApply.emit();
    this._globalStateService.setSortRequest("Rec date (latest first)");
  }

  saveFilters() {
    this.selectedFilters = this._filterService.getFilters();
  }

  loadFilters() {
    this._filterService.setFilters(this.selectedFilters);
    this.transferLocalFiltersToGlobal();
  }
}
