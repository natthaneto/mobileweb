import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDkbLPY3w9lsHeV-1XP4ZCmWUfF1AwWlyY",
  authDomain: "web-lab6-df579.firebaseapp.com",
  projectId: "web-lab6-df579",
  storageBucket: "web-lab6-df579.firebasestorage.app",
  messagingSenderId: "856305774705",
  appId: "1:856305774705:web:b9472bef9f22abf1fd2bd0",
  measurementId: "G-GHMXZDS9S2"
};

// แก้ไขตรงนี้: เช็คก่อนว่า App ถูกสร้างไปหรือยัง
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const auth = getAuth(app);