import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyDDFhM1iMssBz9q77ELWiYP9HoGymPyaBw",
  authDomain: "pareekx-testing.firebaseapp.com",
  projectId: "pareekx-testing",
  storageBucket: "pareekx-testing.firebasestorage.app",
  messagingSenderId: "142243243754",
  appId: "1:142243243754:web:4ed5d415b5c56ed5489993",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
