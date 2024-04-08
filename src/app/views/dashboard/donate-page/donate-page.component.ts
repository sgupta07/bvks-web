import { Component, OnInit } from "@angular/core";
import { Validators, FormControl, FormGroup } from "@angular/forms";
import { TuiCountryIsoCode } from "@taiga-ui/i18n";

import { PaymentService } from "./../../../services/payment.service";

import { CitizenType } from "./../../../models/enums/CitizenType";
import { BankType } from "./../../../models/enums/BankType";
import { PaymentType } from "./../../../models/enums/PaymentType";

import { IDonateData } from "./../../../models/donate-data";
@Component({
  selector: "app-donate-page",
  templateUrl: "./donate-page.component.html",
  styleUrls: ["./donate-page.component.scss"],
})
export class DonatePageComponent implements OnInit {
  form: FormGroup;
  countries = Object.values(TuiCountryIsoCode);
  countryIsoCode = TuiCountryIsoCode.IN;

  isSuccessPopupActive = false;

  citizenType = -1;
  paymentType = -1;
  bankType = -1;

  currencies: string[] = [
    "AED (United Arab Emirates)",
    "ALL (Albanian lek)",
    "AMD (Armenian dram)",
    "ARS (Argentine peso)",
    "AUD (Australian dollar)",
    "AWG (Aruban florin)",
    "BBD (Barbadian dollar)",
    "BDT (Bangladeshi taka)",
    "BMD (Bermudian dollar)",
    "BND (Brunei dollar)",
    "BOB (Bolivian boliviano)",
    "BSD (Bahamian dollar)",
    "BWP (Botswana pula)",
    "BZD (Belize dollar)",
    "CAD (Canadian dollar)",
    "CHF (Swiss franc)",
    "CNY (Chinese Yuan Renminbi)",
    "COP (Colombian peso)",
    "CRC (Costa Rican colon)",
    "CUP (Cuban peso)",
    "CZK (Czech koruna)",
    "DKK (Danish krone)",
    "DOP (Dominican peso)",
    "DZD (Algerian dinar)",
    "EGP (Egyptian pound)",
    "ETB (Ethiopian birr)",
    "EUR (European euro)",
    "FJD (Fijian dollar)",
    "GBP (Pound sterling)",
    "GIP (Gibraltar pound)",
    "GMD (Gambian dalasi)",
    "GTQ (Guatemalan quetzal)",
    "GYD (Guyanese dollar)",
    "HKD (Hong Kong dollar)",
    "HNL (Honduran lempira)",
    "HRK (Croatian kuna)",
    "HTG (Haitian gourde)",
    "HUF (Hungarian forint)",
    "IDR (Indonesian rupiah)",
    "INR (Indian rupee)",
    "ILS (Israeli new shekel)",
    "JMD (Jamaican dollar)",
    "KES (Kenyan shilling)",
    "KGS (Kyrgyzstani som)",
    "KHR (Cambodian riel)",
    "KYD (Cayman Islands dollar)",
    "KZT (Kazakhstani tenge)",
    "LAK (Lao kip)",
    "LBP (Lebanese pound)",
    "LKR (Sri Lankan rupee)",
    "LRD (Liberian dollar)",
    "LSL (Lesotho loti)",
    "MAD (Moroccan dirham)",
    "MDL (Moldovan leu)",
    "MKD (Macedonian denar)",
    "MMK (Myanmar kyat)",
    "MNT (Mongolian tugrik)",
    "MOP (Macanese pataca)",
    "MUR (Mauritian rupee)",
    "MVR (Maldivian rufiyaa)",
    "MWK (Malawian kwacha)",
    "MXN (Mexican peso)",
    "MYR (Malaysian ringgit)",
    "NAD (Namibian dollar)",
    "NGN (Nigerian naira)",
    "NIO (Nicaraguan cordoba)",
    "NOK (Norwegian krone)",
    "NPR (Nepalese rupee)",
    "NZD (New Zealand dollar)",
    "PEN (Peruvian sol)",
    "PGK (Papua New Guinean kina)",
    "PHP (Philippine peso)",
    "PKR (Pakistani rupee)",
    "QAR (Qatari riyal)",
    "RUB (Russian ruble)",
    "SAR (Saudi Arabian riyal)",
    "SCR (Seychellois rupee)",
    "SEK (Swedish krona)",
    "SGD (Singapore dollar)",
    "SLL (Sierra Leonean leone)",
    "SOS (Somali shilling)",
    "SSP (South Sudanese pound)",
    "SVC (Salvadoran colón)",
    "SZL (Swazi lilangeni)",
    "THB (Thai baht)",
    "TTD (Trinidad and Tobago dollar)",
    "TZS (Tanzanian shilling)",
    "USD (United States dollar)",
    "UYU (Uruguayan peso)",
    "UZS (Uzbekistani som)",
    "YER (Yemeni rial)",
    "ZAR (South African rand)",
  ];

  donateForVariants: string[] = [
    "BVKS Media Services (Website, Mobile Application, Audio/Video production, etc.)",
    "Village Development",
    "Gurukula Schools",
    "Book Printing",
    "No preference, BVKS Trust can decide",
    "Other(s)",
  ];

  constructor(private _paymentService: PaymentService) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      payment: new FormControl(null),
      bank: new FormControl(null),
      citizen: new FormControl(null),
      name: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      phone: new FormControl(null, [Validators.required]),
      currencyType: new FormControl("INR (Indian rupee)"),
      donateFor: new FormControl(null),
      others: new FormControl(null),
      amount: new FormControl(null, [Validators.required]),
      address: new FormControl(null, [Validators.required]),
      city: new FormControl(null, [Validators.required]),
      state: new FormControl(null, [Validators.required]),
      zip: new FormControl(null, [Validators.required]),
    });

    this.createSuccessPaymentSubscribtion();
  }

  selectCitizenType(type: CitizenType) {
    this.resetRadioButtons();

    switch (type) {
      case CitizenType.citizen:
        this.citizenType = 0;
        break;
      case CitizenType.oci:
        this.citizenType = 1;
        break;
      case CitizenType.notCitizen:
        this.citizenType = 2;
        break;
    }
  }

  selectBankType(type: BankType) {
    this.paymentType = -1;

    this.form.get("currencyType").patchValue("INR (Indian rupee)");
    this.form.get("payment").reset();

    switch (type) {
      case BankType.indianBank:
        this.bankType = 0;
        break;
      case BankType.nonIndianBank:
        this.bankType = 1;
        break;
    }
  }

  selectPaymentType(type: PaymentType) {
    switch (type) {
      case PaymentType.paymentGateway:
        this.paymentType = 0;
        break;
      case PaymentType.directBank:
        this.paymentType = 1;
        break;
    }
  }

  resetRadioButtons() {
    this.paymentType = -1;
    this.bankType = -1;

    this.form.get("currencyType").patchValue("INR (Indian rupee)");
    this.form.get("payment").reset();
    this.form.get("bank").reset();
  }

  createPayment() {
    const clientData: IDonateData = {
      name: this.form.get("name").value,
      contact: this.form.get("phone").value,
      email: this.form.get("email").value,
      address: `${this.form.get("address").value}, ${
        this.form.get("city").value
      }, ${this.form.get("state").value}, ${this.form.get("zip").value}`,
      currency: this.form.get("currencyType").value.substring(0, 3),
      amount: this.form.get("amount").value,
    };

    if (this.citizenType === 1 || this.citizenType === 2) {
      this._paymentService.createPayment(clientData, "any");

      return;
    }

    this._paymentService.createPayment(clientData, "indian");
  }

  toggleSuccessPopup(status: boolean) {
    this.isSuccessPopupActive = status;
  }

  createSuccessPaymentSubscribtion() {
    this._paymentService.onSuccessPayment.subscribe(() => {
      this.toggleSuccessPopup(true);

      this.form.reset();
      
      this.citizenType = -1;
      this.paymentType = -1;
      this.bankType = -1;
    });
  }
}
