import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Thay thế bằng thông tin từ Firebase Console
// Truy cập: https://console.firebase.google.com/
// Tạo dự án -> Project Settings -> General -> Your apps -> SDK setup and configuration (Config)
const firebaseConfig = {
    apiKey: "AIzaVyDu610sAjmYP_0FPNhicmEDScHraTTu9wc",
    authDomain: "project-8e7b454d-342c-45d5-be0.firebaseapp.com",
    projectId: "project-8e7b454d-342c-45d5-be0",
    storageBucket: "project-8e7b454d-342c-45d5-be0.firebasestorage.app",
    messagingSenderId: "794694614868",
    appId: "1:794694614868:web:d7a54eefae8dacf01f92c1",
    measurementId: "G-HTJ2VMJYXM"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
