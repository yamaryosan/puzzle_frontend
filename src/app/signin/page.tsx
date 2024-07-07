'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Auth, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import useAuth from '../hooks/useAuth';

/**
 * メールアドレスとパスワードでログインする
 * @param auth Firebase Auth インスタンス
 * @param email メールアドレス
 * @param password パスワード
 */
async function signIn(auth: Auth, email: string, password: string) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('ログインに成功しました');
    } catch (error) {
        console.error(error);
        throw new Error('ログインに失敗しました');
    }
}

/**
 * ログイン成功したらダッシュボードにリダイレクト
 * @returns 
 */
async function redirectToDashboard() {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    window.location.href = '/dashboard';
}

export default function Home() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { user, loading } = useAuth();

    // ロード中はローディング画面を表示
    if (loading) {
        return <p>ローディング中...</p>;
    }
    // ログインしている場合はホーム画面にリダイレクト
    if (!loading && user) {
        redirectToDashboard();
        return (
            <div>
                <p>ログインに成功しました。ダッシュボードにリダイレクトします...</p>
                <p>リダイレクトされない場合は<Link href="/dashboard" className="text-blue-500 hover:underline">こちら</Link></p>
            </div>
        );
    }

    // ログインフォームの送信処理
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const auth = getAuth();
        try {
            await signIn(auth, email, password);
        } catch (error : unknown) {
            if (error instanceof Error) {
                setError(error.message);
            }
        }
    };

    return (
        <div className="container mx-auto mt-10 p-4">
            <h1 className="text-2xl font-bold mb-4">メールアドレスとパスワードでログイン</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block mb-1">メールアドレス</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block mb-1">パスワード</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded"
                    />
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                    ログイン
                </button>
            </form>
            <p className="mt-4">
                アカウントをお持ちでない方は <Link href="/signup" className="text-blue-500 hover:underline">こちら</Link> から登録してください。
            </p>
        </div>
    );
};