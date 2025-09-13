import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDlJ0o0I8l6NagvTMjyEPR8yxRmsF5PhvI",
  authDomain: "carooa-e981b.firebaseapp.com",
  projectId: "carooa-e981b",
  storageBucket: "carooa-e981b.appspot.com",
  messagingSenderId: "802370708206",
  appId: "1:802370708206:web:dae5d568f8274b724609ff"
};


const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const generateToken = async () => {
 const permission = await Notification.requestPermission();
 console.log(permission);
 if (permission == "granted") {
    const currentToken = await getToken(messaging, {
      vapidKey: "BN1sPtue3aOoBs0-DaVE2OZ_vFqn_YRCjBtJea1E82j9e7cOdpH3sOmYWUxMxjAykfBBMyVzX2dBWrwFPn61f2U",
    });
    console.log("current token for client: ", currentToken);
    
  }
};

// Request permission, register SW, and get FCM token
// export async function generateToken(vapidKey) {
//   if (!("Notification" in window)) {
//     throw new Error("This browser does not support notifications.");
//   }

//   const permission = await Notification.requestPermission();
//   if (permission !== "granted") return null;
// console.log(permission);

//   // Register service worker (must be root path)
// //   const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

//   // getToken accepts serviceWorkerRegistration for browsers
//   const currentToken = await getToken(messaging, {
//     vapidKey:"BN1sPtue3aOoBs0-DaVE2OZ_vFqn_YRCjBtJea1E82j9e7cOdpH3sOmYWUxMxjAykfBBMyVzX2dBWrwFPn61f2U",
//     // serviceWorkerRegistration: registration
//   }).catch((err) => {
//     console.error("getToken error:", err);
//     return null;
//   });

//   return currentToken; // string or null
// }

// Foreground message listener
export function onMessageListener(callback) {
  onMessage(messaging, (payload) => {
    callback(payload);
  });
}

