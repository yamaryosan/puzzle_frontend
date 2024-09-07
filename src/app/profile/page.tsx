'use client';

import Link from 'next/link';
import { AccountBoxOutlined } from '@mui/icons-material';
import GoogleAuthProfileCard from '@/lib/components/GoogleAuthProfileCard';
import { useState, useEffect } from 'react';
import { getAuth, User } from 'firebase/auth';
import firebaseApp from '@/app/firebase';
import { Box } from '@mui/material';

/**
 * 認証方法を判定
 * @param user ユーザー
 * @returns 認証方法
 */
function checkAuthProvider(user: User) {
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

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, [user]);

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

    return (
        <>
        <Box sx={{ padding: "1rem", backgroundColor: "white", borderRadius: "5px", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)" }}>
            <h2>
                <AccountBoxOutlined />
                プロフィール
            </h2>
            <Box sx={{ marginTop: "1rem" }}>
                <GoogleAuthProfileCard user={user} />
            </Box>
        </Box>
        </>
    );
}