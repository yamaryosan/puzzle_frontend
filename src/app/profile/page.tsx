'use client';

import Link from 'next/link';
import { AccountBoxOutlined } from '@mui/icons-material';
import GoogleAuthProfileCard from '@/lib/components/GoogleAuthProfileCard';
import EmailAuthProfileCard from '@/lib/components/EmailAuthProfileCard';
import { useState, useEffect } from 'react';
import { getAuth, User } from 'firebase/auth';
import firebaseApp from '@/app/firebase';
import { Box, Button } from '@mui/material';
import UserDeleteModal from '@/lib/components/UserDeleteModal';
import CommonButton from '@/lib/components/common/CommonButton';
import CommonPaper from '@/lib/components/common/CommonPaper';

type provider = 'email' | 'google';

/**
 * 認証方法を判定(メールアドレスかGoogleアカウントか)
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
    const provider = user.providerData[0].providerId;
    switch (provider) {
        case 'password':
            return 'email';
        case 'google.com':
            return 'google';
        default:
            throw new Error('未対応の認証方法です');
    }
}

export default function Page() {
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

    // 5秒後に退会ボタンを有効化
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsDeleteButtonDisabled(false);
        }, 5000);
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

    // 退会ボタンがクリックされたとき
    const handleDeleteButton = () => {
        setIsDeleteModalOpen(true);
    };

    return (
        <>
        {isDeleteModalOpen && <UserDeleteModal onButtonClick={setIsDeleteModalOpen} />}
        <CommonPaper>
            <h2>
                <AccountBoxOutlined />
                プロフィール
            </h2>
            <Box sx={{ marginTop: "1rem" }}>
                {authProvider === 'email' && (
                    <EmailAuthProfileCard user={user} />
                )}
                {authProvider === 'google' && (
                    <GoogleAuthProfileCard user={user} />
                )}
            </Box>
        </CommonPaper>
        <Box sx={{ marginTop: "10rem", width: "100%" }}>
            <CommonButton color="error" onClick={handleDeleteButton} disabled={isDeleteButtonDisabled}>
                <AccountBoxOutlined />
                退会する
            </CommonButton>
        </Box>
        </>
    );
}