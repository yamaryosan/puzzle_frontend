import Link from 'next/link';

type PageParams = {
    id: string;
};

export default function Home({ params }: { params: PageParams }) {
    return (
        <div>
            <p>定石{params.id}</p>
            <Link href="/theories/[id]/edit" as={`/theories/${params.id}/edit`}>編集</Link>
            <Link href="/theories">戻る</Link>
        </div>
    );
}