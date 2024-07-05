import firebaseConfig from "./firebaseConfig";
import { initializeApp } from "firebase/app";

// Firebaseを初期化
const firebaseApp = initializeApp(firebaseConfig);
export default firebaseApp;