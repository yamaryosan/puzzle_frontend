'use client';

import { Auth, sendSignInLinkToEmail, signInWithPopup, GoogleAuthProvider, fetchSignInMethodsForEmail, linkWithCredential, getAdditionalUserInfo } from "firebase/auth";
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
async function sendSignUpLink(auth: Auth, email: string, actionCodeSettings: actionCodeSettings) {
    try {
        // メールアドレスの存在確認
        const methods = await fetchSignInMethodsForEmail(auth, email);
        const isExisting = methods.length > 0;

        if (isExisting) {
            console.log('既存ユーザ: メール送信スキップ');
        } else {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        }

        window.localStorage.setItem("emailForSignIn", email);
    } catch (error) {
        console.error(error);
        if (error instanceof FirebaseError) {
            switch (error.code) {
                case 'auth/missing-email':
                    throw new Error('メールアドレスは必須です');
                case 'auth/missing-identifier':
                    throw new Error('メールアドレスは必須です');
                case 'auth/invalid-email':
                    throw new Error('有効なメールアドレスを入力してください');
                case 'auth/operation-not-allowed':
                    throw new Error('メールリンク認証が無効です');
                case 'auth/invalid-continue-uri':
                    throw new Error('無効なURLです。管理者にお問い合わせください');
                case 'auth/quota-exceeded':
                    throw new Error('リクエストの上限に達しました。しばらくしてから再度お試しください');
                case 'auth/unauthorized-continue-uri':
                    throw new Error('このURLは許可されていません。管理者にお問い合わせください');
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
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const user = result.user;

        // ユーザが既に存在している場合は何もしない
        const isNewUser = getAdditionalUserInfo(result)?.isNewUser ?? false;
        if (!isNewUser) {
            console.log("Googleアカウントでサインインしました");
            return true;
        }

        // メールアドレス認証の有無を確認
        const methods = await fetchSignInMethodsForEmail(auth, user.email!);

        // メールアドレス認証が存在しない場合は新規登録
        if (!methods.includes('password')) {
            await createUserInPrisma({
                firebaseUid: user.uid,
                email: user.email,
                displayName: user.displayName,
            });
            await createDefaultPuzzles(user.uid);
            console.log('Googleアカウントで新規登録しました');
            return true;
        }
        if (!credential) {
            throw new Error('Google認証に失敗しました');
        }

        const currentUser = auth.currentUser;
        // 既存のユーザが存在しない場合は新規登録
        if (!currentUser) {
            await createUserInPrisma({
                firebaseUid: user.uid,
                email: user.email,
                displayName: user.displayName,
            });
            await createDefaultPuzzles(user.uid);
            console.log('Googleアカウントで新規登録しました');
            return true;
        }
        // メールアドレス認証のユーザが存在する場合はリンク
        await linkWithCredential(currentUser, credential);
        console.log('Googleアカウントをリンクしました');
        return true;
    } catch (error) {
        console.error(error);
        if (error instanceof FirebaseError) {
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    throw new Error('Google認証がキャンセルされました');
                case 'auth/cancelled-popup-request':
                    throw new Error('Google認証がキャンセルされました');
                case 'auth/popup-blocked':
                    throw new Error('ポップアップがブロックされました。ポップアップを許可してください');
                default:
                    throw new Error('Google認証に失敗しました');
            }
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
            await sendSignUpLink(auth, email, actionCodeSettings);
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
                        <>
                        <p>アカウントが未登録の場合、メールアドレスに送信されたリンクをクリックして登録を完了させてください。</p>
                        <p>アカウントをお持ちの場合、<Link href="/signin" className="text-blue-500 hover:underline">こちらからログイン</Link>してください。</p>
                        </>
                    ) : (
                        <p>メールアドレスを入力してください。</p>
                    )}
                    <CommonInputText value={email} elementType="email" onChange={(e) => setEmail(e.target.value)} disabled={isMailSent}/>
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