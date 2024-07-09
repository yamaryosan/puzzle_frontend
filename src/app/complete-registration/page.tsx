'use client';

import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import firebaseApp from "../firebase";
import { isSignInWithEmailLink, signInWithEmailLink, updatePassword, updateProfile } from "firebase/auth";

export default function App() {
    const auth = getAuth(firebaseApp);
    const [email, setEmail] = useState<string>("");
    const [displayName, setDisplayName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [message, setMessage] = useState<string>("");

    // メールアドレスをローカルストレージから取得
    useEffect(() => {
        const storedEmail = window.localStorage.getItem("emailForSignIn");
        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, []);

    // フォームを送信
    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        // メールリンクからのログインか確認
        if (isSignInWithEmailLink(auth, window.location.href)) {
            try {
                const result = await signInWithEmailLink(auth, email, window.location.href);
                // プロフィール(ユーザ名)を更新
                await updateProfile(result.user, {
                    displayName: displayName,
                });
                // パスワードを更新
                await updatePassword(result.user, password);

                window.localStorage.removeItem("emailForSignIn");
                setMessage("登録が完了しました");
            } catch (error) {
                console.error(error);
            }
        }
    }

    return (
        <form>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="メールアドレス"
                required
            />
            <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="ユーザー名"
                required
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワード"
                required
            />
            <button type="submit" onClick={handleSubmit}>登録を完了する</button>
            {message && <p>{message}</p>}
        </form>
    );
};