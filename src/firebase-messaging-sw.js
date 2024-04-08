// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts("https://www.gstatic.com/firebasejs/8.9.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.9.1/firebase-messaging.js");

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.

firebase.initializeApp({
  apiKey: "AIzaSyCXFbWCZyoeHL8hxbojbexI-kRKPDcirj8",
  authDomain: "bvks-ee662.firebaseapp.com",
  databaseURL: "https://bvks-ee662.firebaseio.com",
  projectId: "bvks-ee662",
  storageBucket: "bvks-ee662.appspot.com",
  messagingSenderId: "184985407900",
  appId: "1:184985407900:web:c3632eef8c2104e727b859",
  measurementId: "G-09LVQMCEL5",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
