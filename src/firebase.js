import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Initialize Firebase (MASTER DATABASE - Formerly Historical/Archive)
// The "Archive" database is now the Single Source of Truth.
const firebaseConfig = {
    apiKey: "AIzaSyBxKAM1tboySNqKnJ79RMU8DyXj_t4mjjE",
    authDomain: "limerickcamogieplayerstats.firebaseapp.com",
    databaseURL: "https://limerickcamogieplayerstats-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "limerickcamogieplayerstats",
    storageBucket: "limerickcamogieplayerstats.firebasestorage.app",
    messagingSenderId: "753951107266",
    appId: "1:753951107266:web:6b319b5035d4a41d5e735b",
    measurementId: "G-6CFNYG9WH1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export the Single Master Database Instance
export const db = getDatabase(app);

// Legacy 'historicalDb' is removed. All components should use 'db'.