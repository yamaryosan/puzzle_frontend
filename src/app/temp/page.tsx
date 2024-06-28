import Link from 'next/link';

export default function Temp() {
    return (
        <div>
            <h1>一時保存中のパズル一覧</h1>
            <Link href="/puzzles/[id]" as="/puzzles/1">パズル1</Link>
            <Link href="/puzzles/[id]" as="/puzzles/2">パズル2</Link>
            <Link href="/puzzles/[id]" as="/puzzles/3">パズル3</Link>
        </div>
    )
}