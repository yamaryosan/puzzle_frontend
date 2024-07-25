'use client';

import Link from 'next/link';
import Editor from '@/lib/components/Editor';
import { useEffect, useState, useRef } from 'react';
import Quill from 'quill';
import { getPuzzleById } from '@/lib/api/puzzleapi';
import { Puzzle } from '@prisma/client';

type PageParams = {
    id: string;
};

type Change = {
    ops: any[];
};

/**
 * APIからパズルを取得
 * @param id 
 * @returns puzzle
 */
async function fetchInitialPuzzle(id: string): Promise<Puzzle | undefined> {
    try {
        const puzzle = await getPuzzleById(id);
        if (!puzzle) {
            console.error("パズルが見つかりません");
            return;
        }
        console.log("パズルを取得しました: ", puzzle);
        return puzzle;
    } catch (error) {
        console.error("パズルの取得に失敗: ", error);
    }
}

export default function Home({ params }: { params: PageParams }) {
    const [range, setRange] = useState<Range>();
    const [lastChange, setLastChange] = useState<Change>();
    const [readOnly, setReadOnly] = useState(false);
    const [DeltaClass, setDeltaClass] = useState<any>();

    // パズル
    const [puzzle, setPuzzle] = useState<Puzzle | null>(null);

    // パズル本文と正答のQuill
    const quillDescriptionRef = useRef<Quill | null>(null);
    const quillSolutionRef = useRef<Quill | null>(null);

    // パズルの取得
    useEffect(() => {
        fetchInitialPuzzle(params.id).then((puzzle) => {
            if (puzzle) {
                setPuzzle(puzzle);
            }
        });
    }, [params.id]);

    useEffect(() => {
        // Deltaクラスを取得
        import('quill').then((module) => {
            const DeltaClass = module.default.import('delta');
            setDeltaClass(() => DeltaClass);
        });
    }, []);

    if (!DeltaClass) {
        return <div>Loading...</div>
    }
    
    return (
        <div>
            <h1>パズル</h1>
            <Editor
                ref={quillDescriptionRef}
                readOnly={readOnly}
                defaultValue={new DeltaClass([{ insert: puzzle?.description }])}
                onSelectionChange={setRange}
                onTextChange={setLastChange}
            />
        </div>
    );
}