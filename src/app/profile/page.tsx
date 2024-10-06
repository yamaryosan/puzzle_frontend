'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AccountBoxOutlined, Google } from '@mui/icons-material';
import GoogleAuthProfileCard from '@/lib/components/GoogleAuthProfileCard';
import EmailAuthProfileCard from '@/lib/components/EmailAuthProfileCard';
import { useState, useEffect } from 'react';
import { getAuth, User, linkWithPopup, GoogleAuthProvider } from 'firebase/auth';
import firebaseApp from '@/app/firebase';
import { Box } from '@mui/material';
import UserDeleteModal from '@/lib/components/UserDeleteModal';
import CommonButton from '@/lib/components/common/CommonButton';
import CommonPaper from '@/lib/components/common/CommonPaper';
import { FirebaseError } from 'firebase/app';
import MessageModal from '@/lib/components/MessageModal';

type provider = 'email' | 'google';

/**
 * 認証方法を判定(メールアドレスかGoogleアカウントか)
 * 両方の認証がある場合はGoogleアカウントを優先
 * @param user ユーザー
 * @returns 認証方法
 */
function checkAuthProvider(user: User): provider {
    if (!user) {
        throw new Error('ユーザーが見つかりません');
    }
    if (user.providerData.length === 0) {
        throw new Error('認証方法が見つかりません');
    }
    const providers = user.providerData.map((provider) => provider.providerId);
    if (providers.includes('google.com')) {
        return 'google';
    }
    if (providers.includes('password')) {
        return 'email';
    }
    throw new Error('未対応の認証方法です');
}

function SearchParamsWrapper() {
    const searchParams = useSearchParams();
    const linked = searchParams.get('linked') === 'true';
    return (
        <>
            {linked && <MessageModal message="Googleアカウントを連携しました" param="linked" />}
        </>
    );
}


export default function Page() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    // 認証方法
    const [authProvider, setAuthProvider] = useState<provider | null>(null);
    // 退会ボタンのクリック可能状態
    const [isDeleteButtonDisabled, setIsDeleteButtonDisabled] = useState(true);
    // 退会モーダルの表示状態
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    setAuthProvider(checkAuthProvider(currentUser));
                } catch (error) {
                    console.error(error);
                }
            }
        });
        return () => unsubscribe();
    }, [user]);

    // 3秒後に退会ボタンを有効化
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsDeleteButtonDisabled(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // ログインしていない場合
    if (!user) {
        return (
            <div>
                <h2>
                    <AccountBoxOutlined />
                    プロフィール
                </h2>
                <p>ログインしていません</p>
                <Link href="/signin">ログイン</Link>
            </div>
        );
    }
    // Googleアカウントとの連携を行う
    const handleGoogleLink = async () => {
        const auth = getAuth(firebaseApp);
        const provider = new GoogleAuthProvider();
        try {
            await linkWithPopup(auth.currentUser!, provider);
            setAuthProvider('google');
            router.push('/profile?linked=true');
            router.refresh();
        } catch (error) {
            if (error instanceof FirebaseError) {
                switch (error.code) {
                    case 'auth/credential-already-in-use':
                        console.error('Googleアカウントは既に連携されています');
                        break;
                    case 'auth/popup-closed-by-user':
                        console.error('Google認証がキャンセルされました');
                        break;
                    case 'auth/cancelled-popup-request':
                        console.error('Google認証がキャンセルされました');
                        break;
                    case 'auth/popup-blocked':
                        console.error('ポップアップがブロックされました。ポップアップを許可してください');
                        break;
                    default:
                        console.error('Google認証に失敗しました');
                        break;
                }
            }
        }
    }

    // 退会ボタンがクリックされたとき
    const handleDeleteButton = () => {
        setIsDeleteModalOpen(true);
    };

    return (
        <>
        <Suspense fallback={null}>
            <SearchParamsWrapper />
        </Suspense>
        {isDeleteModalOpen && <UserDeleteModal onButtonClick={setIsDeleteModalOpen} />}
        <CommonPaper>
            <h2>
                <AccountBoxOutlined />
                プロフィール
            </h2>
            <Box sx={{ marginTop: "1rem" }}>
                {authProvider === 'google' && (
                    <GoogleAuthProfileCard user={user} />
                )}
                {authProvider === 'email' && (
                    <EmailAuthProfileCard user={user} />
                )}
            </Box>
        </CommonPaper>
        <Box sx={{ marginTop: "1rem", width: "100%" }}>
            {authProvider !== 'google' && (
                <CommonButton color="secondary" onClick={handleGoogleLink}>
                    <Google />
                    Google認証を追加
                </CommonButton>
            )}
        </Box>
        <Box sx={{ marginTop: "10rem", width: "100%" }}>
            <CommonButton color="error" onClick={handleDeleteButton} disabled={isDeleteButtonDisabled}>
                <AccountBoxOutlined />
                退会する
            </CommonButton>
        </Box>
        </>
    );
}