import Link from 'next/link';
import AuthLink from '@/lib/components/AuthLink';

export default function App() {
    return (
        <div>
            <h1>ダッシュボード</h1>
            <Link href="/puzzles">パズル一覧</Link>
            <AuthLink href="/puzzles/create" fallbackHref="/signin">パズル作成</AuthLink>
            <AuthLink href="/approaches/create" fallbackHref="/signin">定石作成</AuthLink>
            <AuthLink href="/profile" fallbackHref="/signin">プロフィール</AuthLink>
            <AuthLink href="/temp" fallbackHref="/signin">一時保存中のパズル</AuthLink>
            <Link href="/signout">ログアウト</Link>
        </div>
    )
}