'use client';

import React, { useState, useEffect } from 'react';
import { getAuth, User } from 'firebase/auth';
import firebaseApp from '../../firebase';

import EmailAuthModal from './EmailAuthModal';
import GoogleAuthModal from './GoogleAuthModal';

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
    const [showModal, setShowModal] = useState(false);
    const [authProvider, setAuthProvider] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // 認証方法を判定
                const provider = checkAuthProvider(currentUser);
                setAuthProvider(provider);
            }
        });

        return () => unsubscribe();
    }, []);

    // プロフィール更新ボタンをクリック
    const handleUpdateProfile = () => {
        setShowModal(true);
    };

    // モーダルを閉じる
    const handleCloseModal = () => {
        setShowModal(false);
    }

    // プロフィール更新完了後の処理
    const handleProfileUpdated = () => {
        setShowModal(false);
    }

    return (
        <div>
            <h1>プロフィール編集</h1>
            <button onClick={handleUpdateProfile}>プロフィールを更新</button>
            {showModal && (
                authProvider === 'email' ? (
                    <EmailAuthModal 
                    user={user} 
                    onProfileUpdated={handleProfileUpdated} 
                    onClose={handleCloseModal} />
                ) : authProvider === 'google' ? (
                    <GoogleAuthModal 
                    user={user} 
                    onProfileUpdated={handleProfileUpdated} 
                    onClose={handleCloseModal} />
                ) : null
            )}
        </div>
    );
}

