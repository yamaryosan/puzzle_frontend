import Link from 'next/link';

type PageParams = {
    id: string;
};

export default function Home({ params }: { params: PageParams }) {
    return (
        <div>
            <h1>パズル{params.id}</h1>
            <p>詳細</p>
            <Link href="/puzzles/[id]/edit" as={`/puzzles/${params.id}/edit`}>(管理者のみ)編集</Link>
            <p>解く</p>
            <Link href="/puzzles">戻る</Link>
        </div>
    );
}