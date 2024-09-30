// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);

export const db = getFirestore(app);