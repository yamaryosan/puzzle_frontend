'use client';

import Link from "next/link";
import { useState } from "react";
import { Puzzle } from "@prisma/client";
import { getPuzzles } from "@/lib/api/puzzleapi";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import MessageModal from "@/lib/components/MessageModal";
import useAuth from "@/lib/hooks/useAuth";

type Puzzles = Puzzle[];

export default function Page() {
    const { user, userId} = useAuth();

    const searchParams = useSearchParams();
    const passwordReset = searchParams.get("passwordReset") === "true";
    const [puzzles, setPuzzles] = useState<Puzzles | null>(null);

    // パズル一覧を取得
    useEffect(() => {
        async function fetchPuzzles() {
            if (userId == null) return;
            try {
                const puzzles = await getPuzzles(userId);
                setPuzzles(puzzles);
            } catch (error) {
                console.error("パズルの取得に失敗: ", error);
            }
        }
        fetchPuzzles();
    }, []);

    return (
        <div>
            {passwordReset && ( <MessageModal message="パスワードのリセットが完了しました。" param="passwordReset" /> )}
            <p>難易度で並び替え</p>
            <p>カテゴリー別で並び替え</p>
            <p>ランダムに並び替え</p>
            <p>パズル一覧</p>
            <ul>
                {puzzles?.map((puzzle) => (
                <li key={puzzle.id}>
                    <Link href={`/puzzles/${puzzle.id}`}>
                    {puzzle.title}
                    </Link>
                </li>
                ))}
            </ul>
        </div>
    );
}
