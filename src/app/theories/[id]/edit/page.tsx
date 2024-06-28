import Link from 'next/link';

type PageParams = {
    id: string;
};

export default function Home({ params }: { params: PageParams }) {
    return (
        <div>
            <p>定石{params.id}の編集画面</p>
            <Link href="/theories/[id]" as={`/theories/${params.id}`}>更新</Link>
        </div>
    );
}