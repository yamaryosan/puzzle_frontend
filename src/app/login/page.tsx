import Link from 'next/link';

export default function Home() {
    return (
        <div>
            <p>ログイン</p>
            <form>
                <input type="text" placeholder="ユーザー名" />
                <input type="password" placeholder="パスワード" />
                <button type="submit">ログイン</button>
            </form>
            <Link href="/signup">新規登録</Link>
            <Link href="/password-reset">パスワードを忘れた場合</Link>
        </div>
    );
};