'use client';

import Image from 'next/image';
import Link from 'next/link';
import useAuth from '@/app/hooks/useAuth';

export default function Profile() {
    const {user, authLoading} = useAuth();

    // 読み込み中
    if (authLoading) {
        return <p>読み込み中...</p>;
    }

    return (
        <div>
            <h1>プロフィール</h1>
            <p>ユーザー名: {user?.displayName}</p>
            <p>メールアドレス: {user?.email}</p>
            <Link href="/profile/edit">プロフィール編集</Link>
            <Link href="/dashboard">ダッシュボードへ</Link>
        </div>
    );
}