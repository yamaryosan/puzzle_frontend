"use client";

import { useState } from "react";
import { Puzzle } from "@prisma/client";
import { getPuzzles } from "@/lib/api/puzzleapi";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MessageModal from "@/lib/components/MessageModal";
import { FirebaseUserContext } from "@/lib/context/FirebaseUserContext";
import { useContext } from "react";
import Puzzles from "@/lib/components/Puzzles";

type Puzzles = Puzzle[];

function SearchParamsWrapper() {
    const searchParams = useSearchParams();
    const passwordReset = searchParams.get("passwordReset") === "true";
    const userCreated = searchParams.get("userCreated") === "true";
    const deleted = searchParams.get("deleted") === "true";
    const allDataDeleted = searchParams.get("allDataDeleted") === "true";
    return (
        <>
            {passwordReset && (
                <MessageModal
                    message="パスワードのリセットが完了しました。"
                    param="passwordReset"
                />
            )}
            {userCreated && (
                <MessageModal
                    message="ユーザー登録が完了しました。"
                    param="userCreated"
                />
            )}
            {deleted && (
                <MessageModal message="パズルを削除しました" param="deleted" />
            )}
            {allDataDeleted && (
                <MessageModal
                    message="データを削除しました"
                    param="allDataDeleted"
                />
            )}
        </>
    );
}

export default function Page() {
    const user = useContext(FirebaseUserContext);
    const [puzzles, setPuzzles] = useState<Puzzles | null>(null);

    // パズル一覧を取得
    useEffect(() => {
        async function fetchPuzzles() {
            if (!user) return;
            try {
                const puzzles = await getPuzzles(user.uid);
                setPuzzles(puzzles);
            } catch (error) {
                console.error("パズルの取得に失敗: ", error);
            }
        }
        fetchPuzzles();
    }, [user]);

    return (
        <div>
            <Suspense fallback={null}>
                <SearchParamsWrapper />
            </Suspense>
            <Puzzles />
        </div>
    );
}
