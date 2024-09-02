'use client';

import Link from 'next/link';
import { getApproach, getPuzzlesByApproachId } from '@/lib/api/approachApi';
import { useEffect, useState } from 'react';
import { Approach, Puzzle } from '@prisma/client';
import Viewer from '@/lib/components/Viewer';
import useAuth from '@/lib/hooks/useAuth';
import RecommendSignInDialog from '@/lib/components/RecommendSignInDialog';

type PageParams = {
    id: string;
};

export default function Page({ params }: { params: PageParams }) {
    const { user, userId } = useAuth();
    const [approach, setApproach] = useState<Approach | null>(null);
    const [puzzles, setPuzzles] = useState<Puzzle[] | null>(null);

    // 定石情報を取得
    useEffect(() => {
        async function fetchApproach() {
            const approach = await getApproach(params.id, userId ?? '');
            if (!approach) {
                return;
            }
            setApproach(approach);
        }
        fetchApproach();
    }, [userId]);

    // 定石に紐づく問題情報を取得
    useEffect(() => {
        async function fetchPuzzles() {
            const puzzles = await getPuzzlesByApproachId(params.id, userId ?? '');
            if (!puzzles) {
                return;
            }
            setPuzzles(puzzles);
        }
        fetchPuzzles();
    }, [userId]);

    return (
        <>
        {user ? (
        <div>
            <h1>{approach?.title}</h1>
            <Viewer defaultValue={approach?.content ?? ''} />
            {puzzles?.length === 0 ? <p>問題がありません</p> : ( 
            <div>
                <p>この定石に関連する問題</p>
                <ul>
                    {puzzles?.map((puzzle) => (
                        <li key={puzzle.id}>
                            <Link href={`/puzzles/${puzzle.id}`}>{puzzle.title}</Link>
                        </li>
                    ))}
                </ul>
            </div>
            )}
            <Link href="/approaches/[id]/edit" as={`/approaches/${params.id}/edit`}>編集</Link>
            <Link href="/approaches">戻る</Link>
        </div>
        ) : (
            <div>
                <RecommendSignInDialog />
            </div>
        )}
        </>
    );
}