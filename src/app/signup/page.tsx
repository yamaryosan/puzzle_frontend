'use client';

import { Auth, sendSignInLinkToEmail, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getAuth } from "firebase/auth";
import firebaseApp from "@/app/firebase";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { createUserInPrisma } from "@/lib/api/userapi";
import CommonInputText from '@/lib/components/common/CommonInputText';
import CommonButton from "@/lib/components/common/CommonButton";
import { Box } from "@mui/material";
import { EmailOutlined, Google } from "@mui/icons-material";
import { FirebaseError } from "firebase/app";
import Link from "next/link";
import CommonPaper from "@/lib/components/common/CommonPaper";

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
    try {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem("emailForSignIn", email);
    } catch (error) {
        if (error instanceof FirebaseError) {
            // メールアドレスが未入力の場合
            if (error.code === 'auth/missing-email') {
                throw new Error('メールアドレスを入力してください');
            }
        }
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

export default function Page() {
    const auth = getAuth(firebaseApp);
    const actionCodeSettings = {
        url: `${process.env.NEXT_PUBLIC_URL}/complete-registration`,
        handleCodeInApp: true,
    }
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMailSent, setIsMailSent] = useState(false);

    const router = useRouter();

    // メールを送信
    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        try {
            await sendSignInLink(auth, email, actionCodeSettings);
            setIsMailSent(true);
        } catch (error) {
            console.error(error);
        }
    }

    // Googleアカウントでサインアップ
    const handleGoogleSignUp = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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
        <>
            <CommonPaper>
                <Box component="form">
                    <h2>ユーザ登録</h2>
                    {isMailSent ? (
                        <p>{email}にメールを送信しました。リンクをクリックして登録を完了してください</p>
                    ) : (
                        <p>メールアドレスを入力してください</p>
                    )}
                    {isMailSent ? (
                        <CommonInputText value={email} elementType="email" onChange={(e) => setEmail(e.target.value)} disabled/>
                    ) : (
                        <CommonInputText value={email} elementType="email" onChange={(e) => setEmail(e.target.value)}/>
                    )}
                    <Box sx={{ paddingY: '0.5rem' }}>
                        <CommonButton color="primary" onClick={handleSubmit} disabled={isLoading}>
                            <EmailOutlined />
                            登録リンクを送信
                        </CommonButton>
                    </Box>
                    <Box sx={{ paddingY: '0.5rem' }}>
                        <CommonButton color="secondary" onClick={handleGoogleSignUp} disabled={isLoading}>
                            {isLoading ? "処理中..." : (
                                <>
                                <Google />
                                <span>Googleアカウントで登録</span>
                                </>
                                )}
                        </CommonButton>
                    </Box>
                </Box>
            </CommonPaper>
            <Box sx={{ paddingY: '0.5rem' }}>
                <span>アカウントをお持ちの場合は</span>
                <Link href="/signin" className="text-blue-500 hover:underline">こちらからログイン</Link>
            </Box>
        </>
    );
};