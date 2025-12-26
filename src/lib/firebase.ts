// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDG45eru7r91k4LSIqkd4VxvKbr2g3vJpk",
  authDomain: "portfolio-db-64743.firebaseapp.com",
  projectId: "portfolio-db-64743",
  storageBucket: "portfolio-db-64743.firebasestorage.app",
  messagingSenderId: "1013751443442",
  appId: "1:1013751443442:web:bdf241910a7f035d97056b",
  measurementId: "G-1K60B02G0F"
};

// Initialize Firebase (Singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // <--- ADDED THIS

export { db, auth, storage };