export default function Home() {
    return (
        <div>
            <p>新規登録</p>
            <form>
                <input type="text" placeholder="ユーザー名" />
                <input type="password" placeholder="パスワード" />
                <button type="submit">登録</button>
            </form>
        </div>
    );
};