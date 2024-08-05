'use client';

import Link from 'next/link';
import { getApproaches } from '@/lib/api/approachApi';
import { useEffect, useState } from 'react';
import { Approach } from '@prisma/client';

export default function Page() {
    const [approaches, setApproaches] = useState<Approach[]>([]);

    useEffect(() => {
        getApproaches().then(approaches => {
            if (!approaches) {
                return;
            }
            setApproaches(approaches);
        });
    }, []);

    return (
        <div>
            <Link href="/approaches/create">定石作成</Link>
            <h1>定石一覧</h1>
            {approaches.length === 0 ? <div>定石がありません</div> : null}
            <ul>
                {approaches.map(approach => (
                    <li key={approach.id}>
                        <Link href={`/approaches/${approach.id}`}>{approach.title}</Link>
                    </li>
                ))}
            </ul>
            <Link href="/">戻る</Link>
        </div>
    );
}