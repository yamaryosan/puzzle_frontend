'use client';

import { Auth, sendSignInLinkToEmail } from "firebase/auth";
import { getAuth } from "firebase/auth";
import firebaseApp from "../firebase";
import React, { useState } from "react";

type actionCodeSettings = {
    url: string;
    handleCodeInApp: boolean;
}

/**
 * 新規ユーザ登録のためにメールを送信
 * @param email メールアドレス
 * @param auth Auth
 * @param actionCodeSettings 送信設定
 */
async function sendSignInLink(auth: Auth, email: string, actionCodeSettings: actionCodeSettings) {
    try{
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem("emailForSignIn", email);
    } catch (error) {
        console.error(error);
    }
}

export default function App() {
    const auth = getAuth(firebaseApp);
    const actionCodeSettings = {
        url: "http://localhost:3000/complete-registration",
        handleCodeInApp: true,
    }
    const [email, setEmail] = useState("");
    const [isMailSent, setIsMailSent] = useState(false);

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        sendSignInLink(auth, email, actionCodeSettings);
        setIsMailSent(true);
    }

    return (
        <div>
            <form>
                <h1>新規ユーザ登録</h1>
                {isMailSent ? (
                    <p>メールを送信しました。リンクをクリックして登録を完了してください</p>
                ) : (
                    <p>メールアドレスを入力してください</p>
                )}
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button type="submit" onClick={handleSubmit}>登録</button>
            </form>
        </div>
    );
};