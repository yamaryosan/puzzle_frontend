'use client';

import { useState, useEffect, useRef } from "react";
import { Puzzle } from "@prisma/client";
import Viewer from "@/lib/components/Viewer";
import Editor from "@/lib/components/Editor";
import { getPuzzleById } from "@/lib/api/puzzleapi";
import Quill from "quill";
import { Hint, Approach, Category } from "@prisma/client";
import getHintsByPuzzleId from "@/lib/api/hintapi";
import { getApproachesByPuzzleId } from "@/lib/api/approachApi";
import { getCategoriesByPuzzleId } from "@/lib/api/categoryapi";

type Change = {
    ops: any[];
};

type ApproachWithRelation = {
    id: number;
    puzzle_id: number;
    approach_id: number;
    approach: Approach;
};

type CategoryWithRelation = {
    id: number;
    puzzle_id: number;
    category_id: number;
    category: Category;
};

/**
 * 回答を送信
 * @param id パズルID
 * @param answerRef 回答のQuillの参照
 * @returns 
 */
async function send(id: string, answerRef: React.RefObject<Quill | null>): Promise<Puzzle | undefined> {
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

    const response = await fetch(`/api/puzzles/${id}`, {
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
    return puzzle as Puzzle;
}

export default function Page({ params }: { params: { id: string } }) {
    const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
    const [answer, setAnswer] = useState<string>('');
    const [range, setRange] = useState<Range>();
    const [lastChange, setLastChange] = useState<Change | null>(null);
    const [delta, setDelta] = useState<any[]>([]);

    const answerRef = useRef<Quill | null>(null);

    const [categories, setCategories] = useState<Category[] | null>(null);
    const [hints, setHints] = useState<Hint[] | null>(null);
    const [approaches, setApproaches] = useState<Approach[] | null>(null);

    // パズルを取得
    useEffect(() => {
        async function fetchPuzzle() {
            const puzzle = await getPuzzleById(params.id);
            setPuzzle(puzzle);
        }
        fetchPuzzle();
    }, []);

    // カテゴリーを取得
    useEffect(() => {
        async function fetchCategories() {
            const categories = await getCategoriesByPuzzleId(params.id) as CategoryWithRelation[];
            setCategories(categories ? categories.map(category => category.category) : []);
        }
        fetchCategories();
    }, []);

    // ヒントを取得
    useEffect(() => {
        async function fetchHints() {
            const hints = await getHintsByPuzzleId(params.id);
            setHints(hints || []);
        }
        fetchHints();
    }, []);

    // 定石を取得
    useEffect(() => {
        async function fetchApproaches() {
            const approaches = await getApproachesByPuzzleId(params.id) as ApproachWithRelation[];
            setApproaches(approaches ? approaches.map(approach => approach.approach) : []);
        }
        fetchApproaches();
    }, []);

    if (!puzzle) {
        return <div>loading...</div>;
    }

    return (
        <div>
            <h1>{puzzle.title}</h1>
            <p>カテゴリー</p>
            {categories?.map(category => (
                <div key={category.id}>
                    <h2>{category.name}</h2>
                </div>
            ))}
            {/* パズルの本文 */}
            <p>本文</p>
            <Viewer
                readOnly={true}
                defaultValue={puzzle.description}
            />
            {/* ヒント */}
            <p>ヒント</p>
            {hints?.map((hint, index) => (
                <Viewer
                    key={hint.id}
                    readOnly={true}
                    defaultValue={hint.content}
                />
            ))}

            {/* 定石 */}
            <p>定石</p>
            {approaches?.map(approach => (
                <div key={approach.id}>
                    <h2>{approach.title}</h2>
                    <Viewer
                        readOnly={true}
                        defaultValue={approach.content}
                    />
                </div>
            ))}
            <p>回答を入力してください</p>
            {/* パズルの回答 */}
            <Editor
            ref={answerRef}
            readOnly={false}
            defaultValue={answer}
            onTextChange={setLastChange}
            onSelectionChange={setRange}
            />
            
            <p>正答</p>
            {/* パズルの正答 */}
            <Viewer
                readOnly={true}
                defaultValue={puzzle.solution}
            />
        </div>
    )
}