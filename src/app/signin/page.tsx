'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { Auth, getAdditionalUserInfo, getAuth, signInWithEmailAndPassword, fetchSignInMethodsForEmail, linkWithCredential } from 'firebase/auth';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { createUserInPrisma } from '@/lib/api/userapi';
import { useSearchParams } from 'next/navigation';
import MessageModal from '@/lib/components/MessageModal';
import CommonButton from '@/lib/components/common/CommonButton';
import CommonInputText from '@/lib/components/common/CommonInputText';
import CommonPaper from '@/lib/components/common/CommonPaper';
import { Box } from '@mui/material';
import { LoginOutlined, Google, ErrorOutline } from '@mui/icons-material';
import { FirebaseError } from 'firebase/app';
import FirebaseUserContext from '@/lib/context/FirebaseUserContext';
import { useContext } from 'react';
import DeviceTypeContext from '@/lib/context/DeviceTypeContext';
import { createDefaultPuzzles } from '@/lib/api/puzzleapi';

/**
 * メールアドレスとパスワードでログインする
 * @param auth Firebase Auth インスタンス
 * @param email メールアドレス
 * @param password パスワード
 */
async function signIn(auth: Auth, email: string, password: string) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('ログインに成功しました');
    } catch (error: unknown) {
        if (error instanceof FirebaseError) {
            switch (error.code) {
                case 'auth/invalid-email':
                    throw new Error('メールアドレスを正しく入力してください');
                case 'auth/missing-password':
                    throw new Error('パスワードを入力してください');
                case 'auth/user-not-found':
                    throw new Error('メールアドレスかパスワードが間違っています');
                case 'auth/wrong-password':
                    throw new Error('メールアドレスかパスワードが間違っています');
            }
        }
    }
}

/**
 * ログイン成功したらトップページにリダイレクト
 * @returns 
 */
async function redirectToTopPage() {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    window.location.href = '/';
}

/**
 * Googleアカウントでサインイン
 * @param auth Auth
 */
async function signInWithGoogle(auth: Auth) {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const user = result.user;

        // ユーザが既に存在している場合は通常のサインイン
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

function SearchParamsWrapper() {
    const searchParams = useSearchParams();
    const deleted = searchParams.get('deleted') === 'true';
    return (
        <>
            {deleted && <MessageModal message="アカウントが削除されました。" param="deleted" />}
        </>
    );
}

export default function Page() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const user = useContext(FirebaseUserContext);
    const [GoogleSignInLoading, setGoogleSignInLoading] = useState(false);

    const deviceType = useContext(DeviceTypeContext);

    // ログインしている場合はホーム画面にリダイレクト
    if (user) {
        redirectToTopPage();
        return (
            <div>
                <p>ログインに成功しました。ホーム画面にリダイレクトします...</p>
                <p>リダイレクトされない場合は<Link href="/" className="text-blue-500 hover:underline">こちら</Link></p>
            </div>
        );
    }

    // ログインフォームの送信処理
    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        const auth = getAuth();
        try {
            await signIn(auth, email, password);
        } catch (error : unknown) {
            if (error instanceof Error) {
                setError(error.message);
            }
        }
    };

    // Googleアカウントでサインイン
    const handleGoogleSignIn = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        const auth = getAuth();
        setGoogleSignInLoading(true);
        const success = await signInWithGoogle(auth);
        setGoogleSignInLoading(false);
        if (success) {
            redirectToTopPage();
        } else {
            setError('Google認証に失敗しました。もう一度お試しください。');
        }
    }

    return (
        <>
        <Suspense fallback={null}>
            <SearchParamsWrapper />
        </Suspense>
        <CommonPaper>
            <Box component="form">
                <h2>メールアドレスでログイン</h2>
                <label htmlFor="email">メールアドレス</label>
                <CommonInputText elementType='email' elementId='email' value={email} onChange={(e) => setEmail(e.target.value)} />
                <label htmlFor="password">パスワード</label>
                <CommonInputText elementType='password' elementId='password' value={password} onChange={(e) => setPassword(e.target.value)} />
                <Box sx={{ paddingY: '0.5rem' }}>
                    <CommonButton color="primary" onClick={handleSubmit} disabled={GoogleSignInLoading}>
                        <LoginOutlined />
                        ログイン
                    </CommonButton>
                </Box>
            </Box>
            {error && 
            <Box component="span" sx={{ color: "error.main", display: "flex", gap: "0.5rem" }}>
                <ErrorOutline />
                {error}
            </Box>}
            <Box sx={{ paddingY: '0.5rem' }}>
                <span style={{ fontSize: "1rem" }}>パスワードをお忘れの場合は<Link href="/reset-password" className="text-blue-500 hover:underline">こちら</Link></span>
            </Box>
        </CommonPaper>

        <Box sx={{ paddingY: '2rem' }}>
            <CommonButton color="secondary" onClick={handleGoogleSignIn} disabled={GoogleSignInLoading}>
                {GoogleSignInLoading ? (
                    <>
                    <LoginOutlined />
                    <span>処理中...</span>
                    </>) : (
                    <>
                    <Google />
                    <span>Googleでログイン</span>
                    </>)}
            </CommonButton>
        </Box>

        <Box sx={{ paddingY: '0.5rem' }}>
            <span>アカウントをお持ちでない場合は</span>
            <Link href="/signup" className="text-blue-500 hover:underline">こちらから登録</Link>
        </Box>
        </>
    );
};