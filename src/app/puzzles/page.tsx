import Link from 'next/link';

export default function Home() {
    return (
        <div>
            <p></p>
            <Link href="/puzzles/create">パズル作成</Link>
            <Link href="/puzzles/1">パズル1</Link>
            <Link href="/puzzles/2">パズル2</Link>
            <Link href="/puzzles/3">パズル3</Link>
            <Link href="/">戻る</Link>
        </div>
    );
}