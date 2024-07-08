'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getAuth, updateProfile, updatePassword, verifyBeforeUpdateEmail, User, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { updateEmail } from 'firebase/auth';
import firebaseApp from '../../firebase';

const isEmulator = process.env.NODE_ENV === 'development';


/**
 * Googleアカウントで再認証
 * @returns 
 */
async function reauthenticateWithGoogle(auth: Auth) {
    try {
        if (!auth.currentUser) {
            throw new Error('ユーザーが見つかりません');
        }
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(auth.currentUser, provider);
    } catch (error) {
        console.error(error);
        throw new Error('再認証に失敗しました');
    }
}

    const auth = getAuth(firebaseApp);

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    });
    const [message, setMessage] = useState("");

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                setFormData(prevState => ({
                    ...prevState,
                    username: currentUser.displayName || "",
                    email: currentUser.email || ""
                }));
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [auth]);

    // フォームの入力値を更新
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    }, []);

    // フォームの送信
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (!user || !user.email) {
            setMessage("ユーザー情報が見つかりません");
            return;
        }

        try {
            // 再認証
            const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);
            await reauthenticateWithCredential(user, credential);

            // ユーザー名の更新
            if (formData.username !== user.displayName) {
                await updateProfile(user, { displayName: formData.username });
                setMessage(prevMessage => prevMessage + "ユーザー名を更新しました。 ");
            }

            // パスワードの更新
            if (formData.newPassword) {
                if (formData.newPassword !== formData.confirmNewPassword) {
                    throw new Error("新しいパスワードが一致しません");
                }
                await updatePassword(user, formData.newPassword);
                setMessage(prevMessage => prevMessage + "パスワードを更新しました。 ");
            }

            // メールアドレスの更新
            if (formData.email === user.email) {
                setMessage(prevMessage => prevMessage + "メールアドレスは変更されていません。 ");
            } else {
                if (isEmulator) {
                    await updateEmail(user, formData.email);
                    setMessage(prevMessage => prevMessage + "メールアドレスを更新しました。 ");
                } else {
                    const actionCodeSettings = {
                        url: "http://localhost:3000/signin",
                        handleCodeInApp: true,
                    };
                    await verifyBeforeUpdateEmail(user, formData.email, actionCodeSettings);
                    setMessage(prevMessage => prevMessage + "メールアドレスの確認メールを送信しました。 ");
                }
            }

            // フォームのリセット
            setFormData(prevState => ({
                ...prevState,
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: ""
            }));

        } catch (error) {
            console.error(error);
            setMessage(`更新に失敗しました: ${error instanceof Error ? error.message : '未知のエラー'}`);
        }
    };

    if (loading) return <p>読み込み中...</p>;
    if (!user) return <p>ログインしてください</p>;

    return (
        <div>
            <h1>プロフィール編集</h1>
            <form onSubmit={handleSubmit}>
                {/* フォームフィールド */}
                {Object.entries(formData).map(([key, value]) => (
                    <div key={key}>
                        <label htmlFor={key}>{key}</label>
                        <input
                            type={key.includes('Password') ? 'password' : 'text'}
                            id={key}
                            name={key}
                            value={value}
                            onChange={handleInputChange}
                            disabled={key === 'email' && formData.newPassword !== ''}
                            required={key !== 'newPassword' && key !== 'confirmNewPassword'}
                        />
                    </div>
                ))}
                <button type="submit">更新</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}