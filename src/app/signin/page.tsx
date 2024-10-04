'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { Auth, getAdditionalUserInfo, getAuth, signInWithEmailAndPassword, UserCredential } from 'firebase/auth';
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
            // メールアドレスが未入力や形式が正しくない場合
            if (error.code === 'auth/invalid-email') {
                throw new Error('メールアドレスを正しく入力してください');
            }
            // パスワードが未入力の場合
            if (error.code === 'auth/missing-password') {
                throw new Error('パスワードを入力してください');
            }
            // メールアドレスが未登録の場合
            if (error.code === 'auth/user-not-found') {
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
 * Googleアカウントでサインイン(ユーザが存在しない場合は新規登録)
 * @param auth Auth
 * @returns 認証可否
 */
async function signInWithGoogle(auth: Auth) {
    try {
        const provider = new GoogleAuthProvider();
        const result: UserCredential = await signInWithPopup(auth, provider);
        const isNewUser = getAdditionalUserInfo(result)?.isNewUser ?? false;
        // ユーザが既に存在している場合は何もしない
        if (!isNewUser) {
            console.log("Googleアカウントでサインインしました");
            return true;
        }
        // ユーザが存在しない場合は新規登録
        await createUserInPrisma({
            firebaseUid: auth.currentUser!.uid,
            email: auth.currentUser!.email,
            displayName: auth.currentUser!.displayName,
        });
        // デフォルトのパズルを登録
        await createDefaultPuzzles(auth.currentUser!.uid);
        return true;
    } catch (error) {
        console.error(error);
        return false;
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