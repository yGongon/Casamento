import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCHH8YhS-2GAjuxHjnKZZlllLm7t2o1QAw",
  authDomain: "casamento-wevelley-e-gabriella.firebaseapp.com",
  projectId: "casamento-wevelley-e-gabriella",
  storageBucket: "casamento-wevelley-e-gabriella.firebasestorage.app",
  messagingSenderId: "139178490414",
  appId: "1:139178490414:web:d877a2feca4064881a7dbf",
  measurementId: "G-MWREZGPWJT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();