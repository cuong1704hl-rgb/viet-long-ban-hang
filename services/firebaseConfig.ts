import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Thay thế bằng thông tin từ Firebase Console
// Truy cập: https://console.firebase.google.com/
// Tạo dự án -> Project Settings -> General -> Your apps -> SDK setup and configuration (Config)
const firebaseConfig = {
    apiKey: "API_KEY_CUA_BAN",
    authDomain: "PROJECT_ID.firebaseapp.com",
    projectId: "PROJECT_ID",
    storageBucket: "PROJECT_ID.firebasestorage.app",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
