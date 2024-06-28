import Link from 'next/link';

export default function Home() {
    return (
        <div>
            <p>(ログイン必須)お気に入り</p>
            <Link href="/puzzles/[id]" as="/puzzles/1">パズル1</Link>
            <Link href="/puzzles/[id]" as="/puzzles/2">パズル2</Link>
            <Link href="/puzzles/[id]" as="/puzzles/3">パズル3</Link>
        </div>
    );
}