'use client';

import Viewer from "@/lib/components/Viewer";
import { Puzzle } from "@prisma/client";
import { useState, useEffect } from "react";
import { getPuzzleById } from "@/lib/api/puzzleapi";
import { useRouter } from "next/navigation";
import { Box, Button } from "@mui/material";
import { Rule, Check, Clear } from "@mui/icons-material";
import useAuth from "@/lib/hooks/useAuth";
import RecommendSignInDialog from "@/lib/components/RecommendSignInDialog";

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
    const { user, userId } = useAuth();
    const [puzzle, setPuzzle] = useState<Puzzle | null>();

    // パズルを取得
    useEffect(() => {
        async function fetchPuzzle() {
            try {
                const puzzle = await getPuzzleById(params.id, userId ?? '') as Puzzle;
                setPuzzle(puzzle);
            } catch (error) {
                console.error("パズルの取得に失敗: ", error);
            }
        }
        fetchPuzzle();
    }, [params.id]);

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
        {user ? (
        <Box sx={{  display: 'flex', flexDirection: 'column', width: '100%', padding: '1rem' }}>
            <h2>
                <Rule />
                <span>答え合わせ</span>
            </h2>
            <Box sx={{ paddingY: '0.5rem' }}>
                <h3>問題</h3>
                <Viewer defaultValue={puzzle?.description ?? ""}/>
            </Box>
            <Box sx={{ paddingY: '0.5rem' }}>
                <h3>あなたの解答</h3>
                <Viewer defaultValue={puzzle?.user_answer ?? ""} />
            </Box>
            <Box sx={{ paddingY: '0.5rem' }}>
                <h3>正解</h3>
                <Viewer defaultValue={puzzle?.solution ?? ""}/>
            </Box>
            <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                paddingY: '1rem',
                marginY: '1rem',
                gap: '2rem',
            }}>
                <Button 
                sx={{
                    padding: '1.5rem',
                    backgroundColor: 'success.light',
                    width: '20%',
                    ":hover": {
                        backgroundColor: 'success.main',
                    }
                }}
                onClick={correct}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', scale: "1.8", color: "black" }}>
                        <Check />
                        正解！
                    </Box>
                </Button>

                <Button
                sx={{
                    padding: '1.5rem',
                    backgroundColor: 'error.light',
                    width: '20%',
                    ":hover": {
                        backgroundColor: 'error.main',
                    }
                }}
                onClick={incorrect}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', scale: "1.8", color: "black" }}>
                        <Clear />
                        不正解...
                    </Box>
                </Button>
            </Box>
        </Box>
        ) : (
        <div>
            <RecommendSignInDialog />
        </div>
        )}
        </>
    )
}