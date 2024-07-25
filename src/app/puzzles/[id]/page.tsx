'use client';

import Link from 'next/link';
import { getPuzzleById } from '@/lib/api/puzzleapi';
import { Puzzle } from '@prisma/client';
import { useEffect, useState, useRef } from 'react';
import Viewer from '@/lib/components/Viewer';
import Quill from 'quill';

type PageParams = {
    id: string;
};

export default function Page({ params }: { params: PageParams }) {
    const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
    const quillRef = useRef<Quill | null>(null);

    // パズルを取得
    useEffect(() => {
        async function fetchPuzzle() {
            try {
                const puzzle = await getPuzzleById(params.id);
                setPuzzle(puzzle);
            } catch (error) {
                console.error("パズルの取得に失敗: ", error);
            }
        }
        fetchPuzzle();
    }, [params.id]);

    if (!puzzle) {
        return <div>loading...</div>;
    }

    return (
        <div>
            <h1>{puzzle?.title}</h1>
            <p>本文</p>
            <p>{puzzle.description}</p>
            <Viewer 
            readOnly={true}
            defaultValue={puzzle.description}
            ref={quillRef}
            />
            <p>難易度 : {puzzle.difficulty}</p>
            <p>お気に入り : {puzzle.is_favorite ? 'YES' : 'NO'}</p>
            <Link href="/puzzles/[id]/edit" as={`/puzzles/${params.id}/edit`}>(管理者のみ)編集</Link>
            <p>解く</p>
            <Link href="/puzzles">戻る</Link>
        </div>
    );
}