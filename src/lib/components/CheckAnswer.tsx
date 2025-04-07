"use client";

import Viewer from "@/lib/components/Viewer";
import { puzzles } from "@prisma/client";
import { useState, useEffect } from "react";
import { getPuzzleById } from "@/lib/api/puzzleapi";
import { useRouter } from "next/navigation";
import { Box, Button } from "@mui/material";
import { Rule, Check, Clear } from "@mui/icons-material";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { useContext } from "react";
import DescriptionViewer from "@/lib/components/DescriptionViewer";
import CommonButton from "@/lib/components/common/CommonButton";
import DeviceTypeContext from "@/lib/context/DeviceTypeContext";
import PuzzleNotFound from "@/lib/components/PuzzleNotFound";

/**
 * 正解かどうかを送信
 * @param id パズルID
 * @param isSolved 正解かどうか
 * @returns
 */
async function sendIsSolved(
    id: string,
    isSolved: boolean
): Promise<puzzles | undefined> {
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
        body: JSON.stringify({ isSolved }),
    });
    if (!response.ok) {
        const error = await response.json();
        console.error("パズルの更新に失敗: ", error);
    }
    const puzzle = (await response.json()) as puzzles;
    console.log("パズルの更新に成功: ", puzzle);
    return puzzle;
}

export default function CheckAnswer({ id }: { id: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [puzzle, setPuzzle] = useState<puzzles | null>();
    const user = useContext(FirebaseUserContext);

    const deviceType = useContext(DeviceTypeContext);

    // パズルを取得
    useEffect(() => {
        async function fetchPuzzle() {
            try {
                if (!user) return;
                const puzzle = await getPuzzleById(id, user.uid ?? "");
                if (!puzzle) {
                    console.error("パズルが見つかりません");
                    setIsLoading(false);
                    return;
                }
                setPuzzle(puzzle);
                setIsLoading(false);
            } catch (error) {
                console.error("パズルの取得に失敗: ", error);
                setIsLoading(false);
            }
        }
        fetchPuzzle();
    }, [id, user]);

    // 正解時の処理
    const correct = () => {
        sendIsSolved(id, true);
        router.push("/puzzles?checkAnswer=true");
    };

    // 不正解時の処理
    const incorrect = () => {
        sendIsSolved(id, false);
        router.push("/puzzles?checkAnswer=true");
    };

    if (isLoading) {
        return <div>読み込み中...</div>;
    }

    if (!puzzle) {
        return <PuzzleNotFound />;
    }

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    padding: "1rem",
                }}
            >
                <h2
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                    }}
                >
                    <Rule />
                    <span>答え合わせ</span>
                </h2>

                <DescriptionViewer
                    descriptionHtml={puzzle?.description ?? ""}
                />

                <Box sx={{ paddingY: "0.5rem" }}>
                    <h4>あなたの解答</h4>
                    <Viewer html={puzzle?.user_answer ?? ""} />
                </Box>
                <Box sx={{ paddingY: "0.5rem" }}>
                    <h4>正答</h4>
                    <Viewer html={puzzle?.solution ?? ""} />
                </Box>

                {deviceType === "mobile" && (
                    <Box
                        sx={{
                            paddingY: "0.5rem",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            width: "100%",
                        }}
                    >
                        <CommonButton color="success" onClick={correct}>
                            <Check />
                            正解！
                        </CommonButton>
                        <CommonButton color="error" onClick={incorrect}>
                            <Clear />
                            不正解...
                        </CommonButton>
                    </Box>
                )}
                {deviceType === "desktop" && (
                    <Box
                        sx={{
                            paddingY: "0.5rem",
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                        }}
                    >
                        <CommonButton
                            color="error"
                            onClick={incorrect}
                            width="45%"
                        >
                            <Clear />
                            不正解...
                        </CommonButton>
                        <CommonButton
                            color="success"
                            onClick={correct}
                            width="45%"
                        >
                            <Check />
                            正解！
                        </CommonButton>
                    </Box>
                )}
            </Box>
        </>
    );
}
