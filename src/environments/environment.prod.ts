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
    "https://bvks-d1ac.kxcdn.com/wp-content/uploads/2018/05/20151503/Untitled-2.jpg",
  razorOptions: {
    key: "rzp_live_oh6QtI3lN2c6f8",
    amount: "50000",
    currency: "INR",
    order_id: "",
    name: "BVKS",
    description: "BVKS Transaction",
    image:
      "https://bvks-d1ac.kxcdn.com/wp-content/uploads/2018/05/20151503/Untitled-2.jpg",
    handler: function (response: any) {
      alert(response.razorpay_payment_id);
      alert(response.razorpay_order_id);
      alert(response.razorpay_signature);
    },
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
