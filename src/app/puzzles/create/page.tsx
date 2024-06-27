import Link from "next/link";

export default function Home() {
    return (
        <div>
            <Link href="/">パズル作成</Link>
            <Link href="/puzzles">戻る</Link>
        </div>
    );
}