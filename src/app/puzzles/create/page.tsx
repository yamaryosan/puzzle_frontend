'use client';

import React, { useRef, useState, useEffect } from 'react';
import Quill from 'quill';
import Editor from '@/lib/components/Editor';
import { Puzzle } from '@prisma/client';
import CategoryCheckbox from '@/lib/components/CategoryCheckbox';
import HintsEditor from '@/lib/components/HintsEditor';
import ApproachCheckbox from '@/lib/components/ApproachCheckbox';

type Range = {
    index: number;
    length: number;
};

type Change = {
    ops: any[];
};

/**
 * 内容を送信
 * @param title タイトル
 * @param categoryIds カテゴリーID
 * @param approachIds 定石ID
 * @param quillDescriptionRef 本文のQuillの参照
 * @param quillSolutionRef 正答のQuillの参照
 * @param hintQuills ヒントのQuillの参照
 */
async function sendContent(
    title: string,
    categoryIds: number[],
    approachIds: number[],
    quillDescriptionRef: React.RefObject<Quill | null>,
    quillSolutionRef: React.RefObject<Quill | null>,
    hintQuills: React.RefObject<Quill | null>[]
): Promise<Puzzle | undefined> 
{
    // タイトルが空の場合はUntitledとする
    if (!title) {
        title = "Untitled";
    }
    // Quillの参照が取得できない場合はエラー
    if (!quillDescriptionRef.current || !quillSolutionRef.current) {
        console.error("Quillの参照が取得できません");
        return;
    }
    const descriptionHtml = quillDescriptionRef.current.root.innerHTML;
    const solutionHtml = quillSolutionRef.current.root.innerHTML;
    const difficulty = 1;
    const is_favorite = false;

    // 内容を送信
    const response = await fetch("/api/puzzles", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, descriptionHtml, solutionHtml, difficulty, is_favorite }),
    });
    if (!response.ok) {
        const error = await response.json();
        console.error("パズルの作成に失敗: ", error);
    }
    const puzzle = await response.json();
    console.log("パズルの作成に成功: ", puzzle);

    // カテゴリーを追加
    const puzzleId = puzzle.id;
    const categoryResponse = await fetch(`/api/puzzles/${puzzleId}/categories`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryIds }),
    });
    if (!categoryResponse.ok) {
        const error = await categoryResponse.json();
        console.error("カテゴリーの追加に失敗: ", error);
    }
    console.log("カテゴリーの追加に成功");

    // 定石を追加
    const approachResponse = await fetch(`/api/puzzles/${puzzleId}/approaches`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ approachIds }),
    });
    if (!approachResponse.ok) {
        const error = await approachResponse.json();
        console.error("定石の追加に失敗: ", error);
    }
    console.log("定石の追加に成功");

    // ヒントを追加
    for (let i = 0; i < hintQuills.length; i++) {
        const hintQuill = hintQuills[i].current;
        if (!hintQuill) {
            continue;
        }
        const hintHtml = hintQuill.root.innerHTML;
        const hintResponse = await fetch(`/api/puzzles/${puzzleId}/hints`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ hintHtml }),
        });
        if (!hintResponse.ok) {
            const error = await hintResponse.json();
            console.error("ヒントの追加に失敗: ", error);
        }
        console.log("ヒントの追加に成功");
    }

    return puzzle;
}

export default function Page() {
    const [range, setRange] = useState<Range>();
    const [lastChange, setLastChange] = useState<Change>();
    const [readOnly, setReadOnly] = useState(false);
    const [DeltaClass, setDeltaClass] = useState<any>();

    // タイトル
    const [title, setTitle] = useState<string>("");
    // パズル本文と正答のQuill
    const quillDescriptionRef = useRef<Quill | null>(null);
    const quillSolutionRef = useRef<Quill | null>(null);
    // ヒント群のQuill
    const maxHints = 3;
    const hintQuills = Array.from({length: maxHints}, () => useRef<Quill | null>(null));
    // カテゴリー選択状態
    const [checkedCategories, setCheckedCategories] = useState<number[]>([]);
    // 定石選択状態
    const [approachIds, setApproachIds] = useState<number[]>([]);

    useEffect(() => {
        // Deltaクラスを取得
        import('quill').then((module) => {
            const DeltaClass = module.default.import('delta');
            setDeltaClass(() => DeltaClass);
        });
    });

    if (!DeltaClass) {
        return <div>Loading...</div>
    }

    // カテゴリー選択状態を更新
    const handleCheckboxChange = (checkedCategories: number[]) => {
        setCheckedCategories(checkedCategories);
    };

    return (
        <div>
            <p>タイトル</p>
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required/>
            {/* 本文(description) */}
            <p>内容</p>
            <Editor
            ref={quillDescriptionRef}
            readOnly={readOnly}
            defaultValue={new DeltaClass([{ insert: 'Hello World!' }])}
            onSelectionChange={setRange}
            onTextChange={setLastChange}
            />
            <p>正答</p>
            <Editor
            ref={quillSolutionRef}
            readOnly={readOnly}
            defaultValue={new DeltaClass([{ insert: 'Hello World!' }])}
            onSelectionChange={setRange}
            onTextChange={setLastChange}
            />
            {/* ヒント */}
            <HintsEditor
            maxHints={maxHints}
            defaultValues={Array.from({ length: maxHints }, () => new DeltaClass([{ }]))}
            hintQuills={hintQuills}
            />
            {/* カテゴリ */}
            <CategoryCheckbox 
            onChange={handleCheckboxChange}
            value={checkedCategories}
            />
            {/* 定石 */}
            <ApproachCheckbox
            onChange={setApproachIds}
            value={approachIds}
            />
            {/* 内容を送信 */}
            <button type="button" onClick={() => sendContent( title, checkedCategories, approachIds, quillDescriptionRef, quillSolutionRef, hintQuills)}>
                Send
            </button>
        </div>
    );
}