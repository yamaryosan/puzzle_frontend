import Image from 'next/image';
import Link from 'next/link';

export default function Profile() {
    return (
        <div>
            <h1>プロフィール</h1>
            <Image src="/profile.png" alt="プロフィール画像" width={200} height={200} />
            <p>ユーザー名: ゲスト</p>
            <p>メールアドレス:</p>
            <Link href="/profile/[username]/edit" as="/profile/guest/edit">プロフィール編集</Link>
            <Link href="/dashboard">ダッシュボードへ</Link>
        </div>
    );
}