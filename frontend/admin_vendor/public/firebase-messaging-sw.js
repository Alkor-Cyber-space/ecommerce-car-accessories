// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

// Initialize Firebase inside the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDlJ0o0I8l6NagvTMjyEPR8yxRmsF5PhvI",
  authDomain: "carooa-e981b.firebaseapp.com",
  projectId: "carooa-e981b",
  storageBucket: "carooa-e981b.appspot.com",   // <-- double-check this in Firebase Console
  messagingSenderId: "802370708206",
  appId: "1:802370708206:web:dae5d568f8274b724609ff"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage( (payload) =>   {
  console.log("Background message received:", payload);
  const title = payload.notification?.title || payload.data?.title || "Notification";
  const options = {
    body: payload.notification?.body || payload.data?.body,
    data: payload.data || {}
  };

  self.registration.showNotification(title, options);
});
