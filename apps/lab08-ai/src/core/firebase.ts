import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkbLPY3w9lsHeV-1XP4ZCmWUfF1AwWlyY",
  authDomain: "web-lab6-df579.firebaseapp.com",
  projectId: "web-lab6-df579",
  storageBucket: "web-lab6-df579.firebasestorage.app",
  messagingSenderId: "856305774705",
  appId: "1:856305774705:web:b9472bef9f22abf1fd2bd0",
  measurementId: "G-GHMXZDS9S2"
};

// แก้ไขบรรทัดนี้โดยเติม export ไว้ข้างหน้า
export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);