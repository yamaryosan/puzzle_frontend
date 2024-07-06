'use client';

import Image from 'next/image';
import Link from 'next/link';
import useAuth from './../hooks/useAuth';


export default function Profile() {
    const {user, loading} = useAuth();

    // 読み込み中
    if (loading) {
        return <p>読み込み中...</p>;
    }

    return (
        <div>
            <h1>プロフィール</h1>
            <p>ユーザー名: {user?.displayName}</p>
            <p>メールアドレス: {user?.email}</p>
            <Link href="/profile/[username]/edit" as="/profile/guest/edit">プロフィール編集</Link>
            <Link href="/dashboard">ダッシュボードへ</Link>
        </div>
    );
}