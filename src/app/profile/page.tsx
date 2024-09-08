'use client';

import Link from 'next/link';
import { AccountBoxOutlined } from '@mui/icons-material';
import GoogleAuthProfileCard from '@/lib/components/GoogleAuthProfileCard';
import { useState, useEffect } from 'react';
import { getAuth, User } from 'firebase/auth';
import firebaseApp from '@/app/firebase';
import { Box, Button } from '@mui/material';
import UserDeleteModal from '@/lib/components/UserDeleteModal';
import CommonButton from '@/lib/components/common/CommonButton';

export default function Page() {
    const [user, setUser] = useState<User | null>(null);

    // 退会ボタンのクリック可能状態
    const [isDeleteButtonDisabled, setIsDeleteButtonDisabled] = useState(true);
    // 退会モーダルの表示状態
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
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
        <Box sx={{ padding: "1rem", backgroundColor: "white", borderRadius: "5px", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)" }}>
            <h2>
                <AccountBoxOutlined />
                プロフィール
            </h2>
            <Box sx={{ marginTop: "1rem" }}>
                <GoogleAuthProfileCard user={user} />
            </Box>
        </Box>
        <Box sx={{ marginTop: "10rem", width: "100%" }}>
            <CommonButton color="error" onClick={handleDeleteButton} disabled={isDeleteButtonDisabled}>
                <Box sx={{ scale: "1.8", color: "black", display: "flex", gap: "0.5rem" }}>
                    <AccountBoxOutlined />
                    退会する
                </Box>
            </CommonButton>
        </Box>
        </>
    );
}