import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage"; // Import Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyC2HWN-n082_rAYTNOT5sf0nKdFR2mA7BQ",
  authDomain: "visuallyapp-ed7a5.firebaseapp.com",
  projectId: "visuallyapp-ed7a5",
  storageBucket: "visuallyapp-ed7a5.appspot.com",
  messagingSenderId: "246607397222",
  appId: "1:246607397222:web:882f0fdeb3d367a101c8a7",
  measurementId: "G-BTEFV2MHL2",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const storage = firebase.storage(); // Initialize Firebase Storage

export { db, storage };
