'use client';

import { Auth, sendSignInLinkToEmail, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getAuth } from "firebase/auth";
import firebaseApp from "@/app/firebase";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { createUserInPrisma } from "@/lib/api/userapi";
import { createDefaultPuzzles } from "@/lib/api/puzzleapi";
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
        console.error(error);
        if (error instanceof FirebaseError) {
            switch (error.code) {
                case 'auth/missing-email':
                    throw new Error('メールアドレスは必須です');
                case 'auth/invalid-email':
                    throw new Error('有効なメールアドレスを入力してください');
                case 'auth/operation-not-allowed':
                    throw new Error('メールリンク認証が無効です');
                case 'auth/invalid-continue-uri':
                    throw new Error('無効なURLです。管理者にお問い合わせください');
                case 'auth/quota-exceeded':
                    throw new Error('リクエストの上限に達しました。しばらくしてから再度お試しください');
                default:
                    throw new Error('メールを送信できませんでした');
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
        return true;
    } catch (error) {
        if (error instanceof FirebaseError) {
            return false;
        }
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
    const [error, setError] = useState<string | null>(null);

    const [sendCount, setSendCount] = useState(0);
    const [isDisabled, setIsDisabled] = useState(false);

    const router = useRouter();

    // メールを送信
    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (sendCount > 2) {
            setError("リンクの送信回数が上限に達しました");
            setIsDisabled(true);
            return;
        }
        try {
            await sendSignInLink(auth, email, actionCodeSettings);
            setIsMailSent(true);
            setSendCount(sendCount + 1);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
        }
    }

    // Googleアカウントでサインアップ
    const handleGoogleSignUp = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        setIsLoading(true);
        const success = await signUpWithGoogle(auth);
        setIsLoading(false);
        if (success) {
            await createUserInPrisma({
                firebaseUid: auth.currentUser!.uid,
                email: auth.currentUser!.email,
                displayName: auth.currentUser!.displayName,
            });
            await createDefaultPuzzles(auth.currentUser!.uid);
            router.push("/");
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
                    <p className="text-red-500">{error}</p>
                    <Box sx={{ paddingY: '0.5rem' }}>
                        <CommonButton color="primary" onClick={handleSubmit} disabled={isLoading || isDisabled}>
                            <EmailOutlined />
                            登録リンクを送信
                        </CommonButton>
                    </Box>
                    <Box sx={{ paddingY: '0.5rem' }}>
                        <CommonButton color="secondary" onClick={handleGoogleSignUp} disabled={isLoading}>
                            {isLoading ? "処理中..." : (
                                <>
                                <Google />
                                <span>Googleで登録</span>
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