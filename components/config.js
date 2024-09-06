// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDmlcD_8vgY3H-AhiFeNI9tYSSVAwvfKyQ",
  authDomain: "fir-crud-90fa4.firebaseapp.com",
  projectId: "fir-crud-90fa4",
  storageBucket: "fir-crud-90fa4.appspot.com",
  messagingSenderId: "176468391584",
  appId: "1:176468391584:web:bac7e447ac2d2fda16bbc5",
  measurementId: "G-BPZRTDXJVR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Check if Analytics is supported before initializing
isSupported().then((supported) => {
  if (supported) {
    const analytics = getAnalytics(app);
    console.log("Firebase Analytics is initialized.");
  } else {
    console.log("Firebase Analytics is not supported in this environment.");
  }
});

// Initialize Firestore
const db = getFirestore(app);

export { db };
