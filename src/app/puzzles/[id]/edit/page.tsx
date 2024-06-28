import Link from 'next/link';

type PageParams = {
    id: string;
};

export default function Home({ params }: { params: PageParams }) {
    return (
        <div>
            <h1>パズル</h1>
            <Link href="/puzzles">削除</Link>
            <Link href="/puzzles/[id]" as={`/puzzles/${params.id}`}>投稿</Link>
        </div>
    );
}