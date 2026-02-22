import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAggL8-k7sbjzV0bRkQbJwxHeHIHhkFHfg",
    authDomain: "quyllur2026.firebaseapp.com",
    projectId: "quyllur2026",
    storageBucket: "quyllur2026.firebasestorage.app",
    messagingSenderId: "1044852796789",
    appId: "1:1044852796789:web:16d11707eb6e07793e373c",
    measurementId: "G-709Y6BG0QS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
