'use client';

import Image from 'next/image';
import Link from 'next/link';
import useAuth from '@/lib/hooks/useAuth';
import { AccountBoxOutlined } from '@mui/icons-material';
import ProfileCard from '@/lib/components/ProfileCard';

export default function Profile() {
    const {user, authLoading} = useAuth();

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

    // 読み込み中
    if (authLoading) {
        return <p>読み込み中...</p>;
    }

    return (
        <div>
            <h2>
                <AccountBoxOutlined />
                プロフィール
            </h2>
            <ProfileCard user={user} />
        </div>
    );
}