'use client';

import Link from 'next/link';
import { AccountBoxOutlined } from '@mui/icons-material';
import GoogleAuthProfileCard from '@/lib/components/GoogleAuthProfileCard';
import { useState, useEffect } from 'react';
import { getAuth, User } from 'firebase/auth';
import firebaseApp from '@/app/firebase';
import { Box, Button } from '@mui/material';
import UserDeleteModal from '@/lib/components/UserDeleteModal';

export default function Page() {
    const [user, setUser] = useState<User | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

    // 退会ボタンがクリックされたとき
    const handleDeleteButton = () => {
        setIsDeleteModalOpen(true);
    };

    return (
        <>
        {isDeleteModalOpen && <UserDeleteModal id={user.uid} onButtonClick={setIsDeleteModalOpen} />}
        <Box sx={{ padding: "1rem", backgroundColor: "white", borderRadius: "5px", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)" }}>
            <h2>
                <AccountBoxOutlined />
                プロフィール
            </h2>
            <Box sx={{ marginTop: "1rem" }}>
                <GoogleAuthProfileCard user={user} />
            </Box>
            <Button onClick={handleDeleteButton} sx={{ marginTop: "1rem" }}>
                退会する
            </Button>
        </Box>
        </>
    );
}