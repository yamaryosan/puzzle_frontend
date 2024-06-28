export default function Home() {
    return (
        <div>
            <p>パスワードをリセット</p>
            <form>
                <input type="email" placeholder="メールアドレス" />
                <button type="submit">リセットリンクを送信</button>
            </form>
        </div>
    );
}