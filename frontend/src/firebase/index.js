// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtheJErfsNTIYEffLUpL_oEg1lzJC_y-s",
  authDomain: "driplive-97a26.firebaseapp.com",
  projectId: "driplive-97a26",
  storageBucket: "driplive-97a26.firebasestorage.app",
  messagingSenderId: "16473390776",
  appId: "1:16473390776:web:ff46d63e9c3cd141793e4d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };