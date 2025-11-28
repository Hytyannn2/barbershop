// firebase.ts
// We use /compat/ to make the new V10 library work with your V8 code style
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBbTHYZZnfy9AwDq7Bq8cIsfbLgU566cMQ", // Make sure this key is valid
  authDomain: "barbershop-69.firebaseapp.com",
  projectId: "barbershop-69",
  storageBucket: "barbershop-69.firebasestorage.app",
  messagingSenderId: "452544390742",
  appId: "1:452544390742:web:642f79b6319f3785fd3df7",
  measurementId: "G-T54ZWFRENR"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export the instances in the style your other files expect
export const auth = firebase.auth();
export const db = firebase.firestore();