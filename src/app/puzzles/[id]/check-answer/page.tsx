'use client';

import Viewer from "@/lib/components/Viewer";
import { Puzzle } from "@prisma/client";
import { useState, useEffect } from "react";
import { getPuzzleById } from "@/lib/api/puzzleapi";

export default function Page({ params }: { params: { id: string } }) {
    const [puzzle, setPuzzle] = useState<Puzzle | null>();

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

    // 正解時の処理
    const correct = () => {
        // ここに処理を記述
    };

    // 不正解時の処理
    const incorrect = () => {
        // ここに処理を記述
    };

    return (
        <>
            <p>あなたの回答</p>
            <Viewer
            readOnly={true}
            defaultValue={puzzle.user_answer}
            />
            <p>正答</p>
            <Viewer
            readOnly={true}
            defaultValue={puzzle?.solution}
            />
            <p>正誤</p>
            <button onClick={correct}>正解</button>
            <button onClick={incorrect}>不正解</button>
        </>
    )
}