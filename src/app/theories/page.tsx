import Link from 'next/link';

type PageParams = {
    id: string;
};

export default function Home({ params }: { params: PageParams }) {
    return (
        <div>
            <Link href="/theories/create">定石作成</Link>
            <Link href="/theories/1">定石1</Link>
            <Link href="/theories/2">定石2</Link>
            <Link href="/theories/3">定石3</Link>
            <Link href="/">戻る</Link>
        </div>
    );
}