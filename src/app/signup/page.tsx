'use client';

import { Auth, sendSignInLinkToEmail, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getAuth } from "firebase/auth";
import firebaseApp from "@/app/firebase";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { createUserInPrisma } from "@/lib/api/userapi";

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

/**
 * Googleアカウントでサインアップ
 * @param auth Auth
 */
async function signUpWithGoogle(auth: Auth) {
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        console.log("Googleアカウントでサインアップしました");
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export default function App() {
    const auth = getAuth(firebaseApp);
    const actionCodeSettings = {
        url: "http://localhost:3000/complete-registration",
        handleCodeInApp: true,
    }
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMailSent, setIsMailSent] = useState(false);

    const router = useRouter();

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        sendSignInLink(auth, email, actionCodeSettings);
        setIsMailSent(true);
    }

    const handleGoogleSignUp = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await signUpWithGoogle(auth);
        setIsLoading(false);
        if (success) {
            createUserInPrisma({
                firebaseUid: auth.currentUser!.uid,
                email: auth.currentUser!.email,
                displayName: auth.currentUser!.displayName,
            });
            router.push("/dashboard");
        } else {
            alert("Google認証に失敗しました。もう一度お試しください。");
        }
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
                <hr />
                <button onClick={handleGoogleSignUp} disabled={isLoading}>
                    {isLoading ? "処理中..." : "Googleアカウントで登録"}
                </button>
            </form>
        </div>
    );
};