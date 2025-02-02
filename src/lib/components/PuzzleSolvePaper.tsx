"use client";

import { useState, useEffect, useRef } from "react";
import { puzzles } from "@prisma/client";
import Editor from "@/lib/components/Editor";
import { getPuzzleById } from "@/lib/api/puzzleapi";
import Quill from "quill";
import { categories } from "@prisma/client";
import { getCategoriesByPuzzleId } from "@/lib/api/categoryapi";
import { useRouter } from "next/navigation";
import { Box, Paper } from "@mui/material";
import { Send } from "@mui/icons-material";
import HintsViewer from "@/lib/components/HintsViewer";
import ApproachesViewer from "@/lib/components/ApproachesViewer";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { useContext } from "react";
import CommonButton from "@/lib/components/common/CommonButton";
import CategoryShowPart from "@/lib/components/CategoryShowPart";
import DescriptionViewer from "@/lib/components/DescriptionViewer";
import Delta from "quill-delta";
import PuzzleNotFound from "@/lib/components/PuzzleNotFound";

/**
 * 回答を送信
 * @param id パズルID
 * @param answerRef 回答のQuillの参照
 * @returns
 */
async function send(
    id: string,
    answerRef: React.RefObject<Quill | null>
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
    // Quillの参照が取得できない場合はエラー
    if (!answerRef.current) {
        console.error("Quillの参照が取得できません");
        return;
    }
    const answerHtml = answerRef.current.root.innerHTML;

    const response = await fetch(`/api/puzzles/${id}/answer`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            answer: answerHtml,
        }),
    });
    if (!response.ok) {
        const error = await response.json();
        console.error("回答の送信に失敗: ", error);
        return;
    }
    const puzzle = await response.json();
    console.log("回答の送信に成功: ", puzzle);
    return puzzle as puzzles;
}

type Range = {
    index: number;
    length: number;
};

export default function PuzzleSolvePaper({ id }: { id: string }) {
    const router = useRouter();

    const [puzzle, setPuzzle] = useState<puzzles | null>(null);

    const [, setRange] = useState<Range | null>(null);
    const [, setLastChange] = useState<Delta | null>(null);

    const answerRef = useRef<Quill | null>(null);
    const [userAnswerDelta, setUserAnswerDelta] = useState<Delta>();

    const [categories, setCategories] = useState<categories[] | null>(null);
    const user = useContext(FirebaseUserContext);

    const [isLoading, setIsLoading] = useState(true);

    // パズルを取得
    useEffect(() => {
        async function loadQuill() {
            // パズルを取得
            const puzzle = await getPuzzleById(id, user?.uid ?? "");
            if (!puzzle) {
                setIsLoading(false);
                console.error("パズルが取得できません");
                return;
            }
            console.log("パズルを取得しました: ", puzzle);
            setPuzzle(puzzle);
            const quillModule = await import("quill");
            const Delta = quillModule.default.import("delta");
            const quill = new quillModule.default(
                document.createElement("div")
            );
            if (!puzzle.user_answer) {
                setUserAnswerDelta(new Delta());
                setIsLoading(false);
                return;
            }
            const userAnswerDelta = quill.clipboard.convert({
                html: puzzle.user_answer,
            });
            setUserAnswerDelta(new Delta(userAnswerDelta.ops));
            setIsLoading(false);
        }
        loadQuill();
    }, [id, user]);

    // カテゴリーを取得
    useEffect(() => {
        async function fetchCategories() {
            if (!user) return;
            const categories = (await getCategoriesByPuzzleId(
                id,
                user.uid ?? ""
            )) as categories[];
            setCategories(categories);
        }
        fetchCategories();
    }, [id, user]);

    // 送信
    const handleSend = async () => {
        const puzzle = await send(id, answerRef);
        if (puzzle) {
            router.push(`/puzzles/${id}/check-answer`);
        }
    };

    if (isLoading) {
        return <div>読み込み中...</div>;
    }

    if (!puzzle) {
        return <PuzzleNotFound />;
    }

    return (
        <>
            <Paper sx={{ padding: "1rem" }}>
                <h2>「{puzzle?.title}」の解答画面</h2>
                <CategoryShowPart categories={categories ?? []} />

                <DescriptionViewer
                    descriptionHtml={puzzle?.description ?? ""}
                />

                <HintsViewer puzzleId={id} />

                <ApproachesViewer puzzleId={id} />

                <Box sx={{ paddingY: "0.5rem" }}>
                    <h4>解答を入力</h4>
                    <Editor
                        defaultValue={userAnswerDelta || new Delta()}
                        onSelectionChange={setRange}
                        onTextChange={setLastChange}
                        ref={answerRef}
                    />
                </Box>

                <CommonButton
                    color="secondary"
                    onClick={() => handleSend()}
                    width="100%"
                >
                    <Send />
                    <span>解答を送信</span>
                </CommonButton>
            </Paper>
        </>
    );
}
