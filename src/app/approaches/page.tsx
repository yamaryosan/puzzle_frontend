import Link from 'next/link';

type PageParams = {
    id: string;
};

export default function Page({ params }: { params: PageParams }) {
    return (
        <div>
            <Link href="/approaches/create">定石作成</Link>
            <Link href="/approaches/1">定石1</Link>
            <Link href="/approaches/2">定石2</Link>
            <Link href="/approaches/3">定石3</Link>
            <Link href="/">戻る</Link>
        </div>
    );
}