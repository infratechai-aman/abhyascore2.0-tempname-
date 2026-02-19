import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDuvFguUvU4ZA2KUxWqdYb2JJydgMMRaQM",
    authDomain: "abhyascore2.firebaseapp.com",
    projectId: "abhyascore2",
    storageBucket: "abhyascore2.firebasestorage.app",
    messagingSenderId: "552286172001",
    appId: "1:552286172001:web:655e4093a608125baf0b20",
    measurementId: "G-0MJY3F8TEW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
