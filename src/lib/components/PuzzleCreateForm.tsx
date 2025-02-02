"use client";

import React, { useRef, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { Puzzle } from "@prisma/client";
import Quill from "quill";
import Delta from "quill-delta";
import TitleEditor from "@/lib/components/TitleEditor";
import DescriptionEditor from "@/lib/components/DescriptionEditor";
import SolutionEditor from "@/lib/components/SolutionEditor";
import HintsEditor from "@/lib/components/HintsEditor";
import CategoryCheckbox from "@/lib/components/CategoryCheckbox";
import ApproachCheckbox from "@/lib/components/ApproachCheckbox";
import DifficultEditor from "@/lib/components/DifficultyEditor";
import { Upload } from "@mui/icons-material";
import CommonButton from "@/lib/components/common/CommonButton";

/**
 * 内容を送信
 * @param title タイトル
 * @param categoryIds カテゴリーID
 * @param approachIds 定石ID
 * @param descriptionRef 本文のQuillの参照
 * @param solutionRef 正答のQuillの参照
 * @param hintRefs ヒントのQuillの参照
 * @param difficulty 難易度
 * @param uId FirebaseユーザーID
 */
async function sendContent(
    title: string,
    categoryIds: number[],
    approachIds: number[],
    descriptionRef: React.RefObject<Quill | null>,
    solutionRef: React.RefObject<Quill | null>,
    hintRefs: React.RefObject<Quill | null>[],
    difficulty: number,
    userId: string
): Promise<Puzzle | undefined> {
    // タイトルが空の場合はUntitledとする
    if (!title) {
        title = "Untitled";
    }
    // Quillの参照が取得できない場合はエラー
    if (!descriptionRef.current || !solutionRef.current) {
        console.error("Quillの参照が取得できません");
        return;
    }
    // IDが取得できない場合はエラー
    if (!userId) {
        console.error("ユーザIDが取得できません");
        return;
    }

    const descriptionHtml = descriptionRef.current.root.innerHTML;
    const solutionHtml = solutionRef.current.root.innerHTML;
    const is_favorite = false;

    // 内容を送信
    const response = await fetch("/api/puzzles", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title,
            descriptionHtml,
            solutionHtml,
            difficulty,
            is_favorite,
            userId,
        }),
    });
    if (!response.ok) {
        const error = await response.json();
        console.error("パズルの作成に失敗: ", error);
    }
    const puzzle = await response.json();
    console.log("パズルの作成に成功: ", puzzle);

    // カテゴリーを追加
    const puzzleId = puzzle.id;
    const categoryResponse = await fetch(
        `/api/puzzles/${puzzleId}/categories`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ categoryIds }),
        }
    );
    if (!categoryResponse.ok) {
        const error = await categoryResponse.json();
        console.error("カテゴリーの追加に失敗: ", error);
    }
    console.log("カテゴリーの追加に成功");

    // 定石を追加
    const approachResponse = await fetch(
        `/api/puzzles/${puzzleId}/approaches`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ approachIds }),
        }
    );
    if (!approachResponse.ok) {
        const error = await approachResponse.json();
        console.error("定石の追加に失敗: ", error);
    }
    console.log("定石の追加に成功");

    // ヒントを追加
    const hintHtmls = hintRefs.map((hintRef) => {
        if (!hintRef.current) {
            return "";
        }
        return hintRef.current.root.innerHTML;
    });
    if (!hintHtmls) {
        console.error("ヒントの取得に失敗");
        return puzzle;
    }
    console.log(hintHtmls);

    const hintsResponse = await fetch(
        `/api/puzzles/${puzzleId}/hints?userId=${userId}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ hintHtmls }),
        }
    );
    if (!hintsResponse.ok) {
        const error = await hintsResponse.json();
        console.error("ヒントの更新に失敗: ", error);
    }
    console.log("ヒントの更新に成功");
    return puzzle;
}

type Range = {
    index: number;
    length: number;
};

export default function PuzzleCreateForm() {
    const user = useContext(FirebaseUserContext);
    const router = useRouter();

    const [title, setTitle] = useState<string>("");

    const [, setRange] = useState<Range | null>(null);
    const [, setLastChange] = useState<Delta | null>(null);
    const descriptionRef = useRef<Quill | null>(null);
    const solutionRef = useRef<Quill | null>(null);

    const hintRef1 = useRef<Quill | null>(null);
    const hintRef2 = useRef<Quill | null>(null);
    const hintRef3 = useRef<Quill | null>(null);
    const hintRefs = [hintRef1, hintRef2, hintRef3];

    const maxHints = 3;
    const [checkedCategories, setCheckedCategories] = useState<number[]>([]);
    const [approachIds, setApproachIds] = useState<number[]>([]);
    const [difficulty, setDifficulty] = useState<number>(1);

    useEffect(() => {
        // Deltaクラスを取得
        async function loadQuill() {
            const quillModule = await import("quill");
            const Delta = quillModule.default.import("delta");
        }
        loadQuill();
    }, []);

    if (!Delta) {
        return <div>Loading...</div>;
    }

    // カテゴリー選択状態
    const handleCheckboxChange = (checkedCategories: number[]) => {
        setCheckedCategories(checkedCategories);
    };

    // 送信ボタン押下時の処理
    const handleSendButton = async () => {
        if (!title) {
            alert("タイトルを入力してください");
            return;
        }
        const description = descriptionRef.current?.editor.delta.ops
            .map((op: any) => op.insert)
            .join("");
        if (description?.trim() === "") {
            alert("問題文を入力してください");
            return;
        }
        const solution = solutionRef.current?.editor.delta.ops
            .map((op: any) => op.insert)
            .join("");
        if (solution?.trim() === "") {
            alert("正答を入力してください");
            return;
        }

        const puzzle = await sendContent(
            title,
            checkedCategories,
            approachIds,
            descriptionRef,
            solutionRef,
            hintRefs,
            difficulty,
            user?.uid || ""
        );
        if (puzzle) {
            router.push(`/puzzles/${puzzle.id}?created=true`);
        }
    };

    return (
        <>
            <TitleEditor title={title} setTitle={setTitle} />

            <DescriptionEditor
                containerRef={descriptionRef}
                onSelectionChange={setRange}
                onTextChange={setLastChange}
            />

            <SolutionEditor
                containerRef={solutionRef}
                onSelectionChange={setRange}
                onTextChange={setLastChange}
            />

            <HintsEditor
                refs={hintRefs}
                maxHints={maxHints}
                defaultValues={Array.from(
                    { length: maxHints },
                    () => new Delta()
                )}
            />

            <CategoryCheckbox
                userId={user?.uid || ""}
                onChange={handleCheckboxChange}
                puzzle_id="0"
                value={checkedCategories}
            />

            <ApproachCheckbox
                onChange={setApproachIds}
                puzzle_id="0"
                value={approachIds}
            />

            <DifficultEditor value={difficulty} onChange={setDifficulty} />

            <CommonButton color="secondary" onClick={() => handleSendButton()}>
                <Upload />
                作成
            </CommonButton>
        </>
    );
}
