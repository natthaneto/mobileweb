import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDkbLPY3w9lsHeV-1XP4ZCmWUfF1AwWlyY",
  authDomain: "web-lab6-df579.firebaseapp.com",
  projectId: "web-lab6-df579",
  storageBucket: "web-lab6-df579.firebasestorage.app",
  messagingSenderId: "856305774705",
  appId: "1:856305774705:web:b9472bef9f22abf1fd2bd0",
  measurementId: "G-GHMXZDS9S2"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app); 

export const analytics = getAnalytics(app);