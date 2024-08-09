'use client';

import Viewer from "@/lib/components/Viewer";
import { Puzzle } from "@prisma/client";
import { useState, useEffect } from "react";
import { getPuzzleById } from "@/lib/api/puzzleapi";
import { useRouter } from "next/navigation";

/**
 * 正解かどうかを送信
 * @param id パズルID
 * @param isSolved 正解かどうか
 * @returns 
 */
async function sendIsSolved(id: string, isSolved: boolean): Promise<Puzzle | undefined> {
    // IDが空の場合はエラー
    if (!id) {
        console.error("IDが空です");
        return;
    }
    // IDが0以下の場合はエラー
    if (parseInt(id) <= 0) {
        console.error("IDが不正です");
        return;
    }
    const response = await fetch(`/api/puzzles/${id}/is-solved`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({isSolved})
    });
    if (!response.ok) {
        const error = await response.json();
        console.error("パズルの更新に失敗: ", error);
    }
    const puzzle = await response.json() as Puzzle;
    console.log("パズルの更新に成功: ", puzzle);
    return puzzle;
}

export default function Page({ params }: { params: { id: string } }) {
    const router = useRouter();

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
        sendIsSolved(params.id, true);
        router.push("/puzzles");
    };

    // 不正解時の処理
    const incorrect = () => {
        const isSolved = false;
        sendIsSolved(params.id, false);
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