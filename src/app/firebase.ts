import firebaseConfig from "./firebaseConfig";
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Firebaseを初期化
const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);

// 開発環境の場合、エミュレータに接続
if (process.env.NODE_ENV === 'development') {
    connectAuthEmulator(auth, "http://localhost:9099");
}

export default firebaseApp;