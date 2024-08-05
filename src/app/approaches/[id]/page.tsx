'use client';

import Link from 'next/link';
import { getApproach } from '@/lib/api/approachApi';
import { useEffect, useState } from 'react';
import { Approach } from '@prisma/client';
import Viewer from '@/lib/components/Viewer';

type PageParams = {
    id: string;
};

export default function Page({ params }: { params: PageParams }) {
    const [approach, setApproach] = useState<Approach | null>(null);

    useEffect(() => {
        async function fetchApproach() {
            const approach = await getApproach(parseInt(params.id));
            if (!approach) {
                return
            }
            setApproach(approach);
        }
        fetchApproach();
    }, []);

    if (!approach) {
        return <div>loading...</div>;
    }

    return (
        <div>
            <h1>{approach.title}</h1>
            <Viewer 
            readOnly={true}
            defaultValue={approach.content}
            />

            <Link href="/approaches/[id]/edit" as={`/approaches/${params.id}/edit`}>編集</Link>
            <Link href="/approaches">戻る</Link>
        </div>
    );
}