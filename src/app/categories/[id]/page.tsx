import Link from 'next/link';

type PageParams = {
    id: string;
};

export default function Home({ params }: { params: PageParams}) {
    return (
        <div>
            <p>カテゴリー: {params.id}</p>
            <p>ランダムに並び替え</p>
            <p>難易度で並び替え</p>
            <Link href="/categories">カテゴリー一覧へ</Link>
        </div>
    );
}