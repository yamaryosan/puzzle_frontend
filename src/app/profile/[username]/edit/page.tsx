import Link from 'next/link';

export default function Edit() {
    return (
        <div>
            <h1>プロフィール編集</h1>
            <form>
                <label>ユーザー名</label>
                <input type="text" />
                <label>メールアドレス</label>
                <input type="email" />
                <button type="submit">更新</button>
                <Link href="/profile">キャンセル</Link>
            </form>
        </div>
    );
}