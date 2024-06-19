// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  serverUrl: "https://download.bvksdigital.com",
  elasticUrl: "https://elastic.bvksmedia.net/api/",
  firebase: {
    apiKey: "AIzaSyCXFbWCZyoeHL8hxbojbexI-kRKPDcirj8",
    authDomain: "bvks-ee662.firebaseapp.com",
    databaseURL: "https://bvks-ee662.firebaseio.com",
    projectId: "bvks-ee662",
    storageBucket: "bvks-ee662.appspot.com",
    messagingSenderId: "184985407900",
    appId: "1:184985407900:web:c3632eef8c2104e727b859",
    measurementId: "G-09LVQMCEL5",
  },
  lectionThumbnailPlaceholder:
    "https://cdn.bvksmedia.com/wp-content/uploads/2018/05/20151503/Untitled-2.jpg",
  razorOptions: {
    key: "rzp_test_LvDUh4q43pNF8G",
    handler: null as any,
    amount: "50000",
    currency: "INR",
    order_id: "",
    name: "BVKS",
    description: "BVKS Transaction",
    image:
      "https://cdn.bvksmedia.com/wp-content/uploads/2018/05/20151503/Untitled-2.jpg",
    callback_url: "",
    prefill: {
      name: "",
      email: "",
      contact: "",
    },
    notes: {
      address: "",
    },
    theme: {
      color: "#fd7e14",
    },
  },
  razorpayUrl: "https://api.razorpay.com/v1",
  indianRazorKey: "rzp_live_oh6QtI3lN2c6f8",
  overseasRazorKey: "rzp_live_9vXnIK1pCzdgN3",
  cutLinkUrl: "https://is.gd/create.php?format=json&url=",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
