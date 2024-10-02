// components/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDjPWMCpHsCPs4_Shz4_5mKtUFqzp2JFc4',
  authDomain: 'insighteye-science.firebaseapp.com',
  projectId: 'insighteye-science',
  storageBucket: 'insighteye-science.appspot.com',
  messagingSenderId: '358758476248',
  appId: '1:358758476248:web:2b4a21c8b7c6051a70eaad',
  measurementId: 'G-0530PFDR4Q',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
