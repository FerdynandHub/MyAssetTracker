// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";  // for database
import { getAnalytics } from "firebase/analytics";  // optional

const firebaseConfig = {
  apiKey: "AIzaSyDuBncS_uGBPybk4j0q0N774bOBPnazCGY",
  authDomain: "dastrack-database.firebaseapp.com",
  projectId: "dastrack-database",
  storageBucket: "dastrack-database.firebasestorage.app",
  messagingSenderId: "1074325086604",
  appId: "1:1074325086604:web:918d4f59eeb21a233e76a9",
  measurementId: "G-S09TR2KC4L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db, analytics };
