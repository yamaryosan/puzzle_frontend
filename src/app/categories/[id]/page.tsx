import Link from 'next/link';

type PageParams = {
    id: string;
};

export default function Home({ params }: { params: PageParams}) {
    return (
        <div>
            <p>カテゴリー: {params.id}</p>
            <Link href="/categories">カテゴリー一覧へ</Link>
        </div>
    );
}