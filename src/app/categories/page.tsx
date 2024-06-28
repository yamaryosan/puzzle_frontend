import Link from 'next/link';

export default function Categories() {
    return (
        <div>
            <p>カテゴリー一覧</p>
            <Link href="/categories/[id]" as="/categories/1">数学パズル</Link>
            <Link href="/categories/[id]" as="/categories/2">物理パズル</Link>
            <Link href="/categories/[id]" as="/categories/3">謎解き</Link>
        </div>
    );
}