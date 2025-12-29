import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBkiDyCQ74Qg2A2bf0-kdtHo8KTil3xTX0",
    authDomain: "limerickcamogielivetracker.firebaseapp.com",
    projectId: "limerickcamogielivetracker",
    storageBucket: "limerickcamogielivetracker.firebasestorage.app",
    messagingSenderId: "165082930270",
    appId: "1:165082930270:web:f49fb5a2910747ce1428cf",
    measurementId: "G-TL90WTD4N2",
    databaseURL: "https://limerickcamogielivetracker-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getDatabase(app);