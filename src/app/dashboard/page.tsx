import Link from 'next/link';

export default function App() {
    return (
        <div>
            <h1>ダッシュボード</h1>
            <Link href="/puzzles/create">パズル作成</Link>
            <Link href="/theories/create">定石作成</Link>
        </div>
    )
}