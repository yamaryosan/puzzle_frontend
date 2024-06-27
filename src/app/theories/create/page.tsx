import Link from "next/link";

export default function Home() {
    return (
        <div>
            <p>定石作成画面</p>
            <Link href="/">作成</Link>
            <Link href="/theories">戻る</Link>
        </div>
    );
}