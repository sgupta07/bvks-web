import { BaseRequestService } from "./base-request.service";
import { Injectable, EventEmitter } from "@angular/core";
import { v4 as uuidv4 } from "uuid";
import { environment } from "src/environments/environment";

import { IDonateData } from "./../models/donate-data";

function _window(): any {
  return window;
}

interface IPayment {
  amount: number;
  currency: string;
  outsideBank: boolean;
}

interface IPaymentResponse {
  orderId: string;
}

@Injectable({
  providedIn: "root",
})
export class PaymentService {
  onSuccessPayment = new EventEmitter<void>();

  get nativeWindow() {
    return _window();
  }

  constructor(private _baseRequest: BaseRequestService) { }

  async createPayment(
    clientData: IDonateData,
    bankType: "indian" | "any" = "indian"
  ) {
    let options = environment.razorOptions;
    if (bankType !== "indian") {
      options.key = environment.overseasRazorKey;
    } else {
      options.key = environment.indianRazorKey;
    }

    const paymentDetails = {
      amount: Number(clientData.amount) * 100,
      currency: clientData.currency,
      outsideBank: bankType !== "indian",
    };

    const { orderId } = await this.getOrderId(paymentDetails);

    if (clientData) {
      options.prefill.name = clientData?.name;
      options.prefill.contact = clientData?.contact;
      options.prefill.email = clientData?.email;
      options.currency = clientData?.currency;
      options.amount = clientData.amount.toString() + "00";
      options.notes.address = clientData?.address;
      options.order_id = orderId;
    }

    options.handler = this.callSuccessPopup.bind(this);

    const rzp = new this.nativeWindow.Razorpay(options);

    rzp.open();
  }

  private async getOrderId(paymentDetails: IPayment) {
    try {
      const orderId = await this._baseRequest.post<IPaymentResponse>(
        "/payment",
        paymentDetails,
        false
      );
      console.log("orderId", orderId);
      return orderId;
    } catch (err) {
      alert(err.error.error.description)
    }
  }

  private callSuccessPopup() {
    this.onSuccessPayment.emit();
  }
}
