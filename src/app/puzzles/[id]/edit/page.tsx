'use client';

import Link from 'next/link';
import Editor from '@/lib/components/Editor';
import { useEffect, useState, useRef } from 'react';
import { getPuzzleById } from '@/lib/api/puzzleapi';
import { Puzzle } from '@prisma/client';
import Quill from 'quill';
import Portal from '@/lib/components/Portal';
import DeleteModal from '@/lib/components/DeleteModal';
import CategoryCheckbox from '@/lib/components/CategoryCheckbox';

type PageParams = {
    id: string;
};

type Change = {
    ops: any[];
};

type PuzzleWithCategories = {
    id: number;
    title: string;
    description: string;
    solution: string;
    user_answer: string;
    difficulty: number;
    is_favorite: boolean;
    created_at: Date;
    updated_at: Date;
    PuzzleCategory: {
        category: {
            id: number;
            name: string;
        }
    }[]
}

/**
 * 内容を送信
 * @param id パズルID
 * @param title タイトル
 * @param categoryIds カテゴリーID
 * @param quillDescriptionRef 本文のQuillの参照
 * @param quillSolutionRef 正答のQuillの参照
 */
async function send(id: string, title: string, categoryIds: number[], quillDescriptionRef: React.RefObject<Quill | null>, quillSolutionRef: React.RefObject<Quill | null>): Promise<Puzzle | undefined> 
{
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

    const response = await fetch(`/api/puzzles/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, categoryIds, descriptionHtml, solutionHtml, difficulty, is_favorite }),
    });
    if (!response.ok) {
        const error = await response.json();
        console.error("パズルの編集に失敗: ", error);
    }
    const puzzle = await response.json();
    console.log("パズルの編集に成功: ", puzzle);
    return puzzle;
}

/**
 * 編集前のパズルを取得
 * @param id パズルID
 * @returns Promise<PuzzleWithCategories | undefined> パズル
 */
async function fetchInitialPuzzle(id: string): Promise<PuzzleWithCategories | undefined> {
    try {
        const puzzle = await getPuzzleById(id);
        if (!puzzle) {
            console.error("パズルが見つかりません");
            return;
        }
        console.log("パズルを取得しました: ", puzzle);
        return puzzle;
    } catch (error) {
        console.error("パズルの取得に失敗: ", error);
    }
}

export default function Page({ params }: { params: PageParams }) {
    const [range, setRange] = useState<Range>();
    const [lastChange, setLastChange] = useState<Change>();
    const [puzzle, setPuzzle] = useState<PuzzleWithCategories | null>(null);
    const [title, setTitle] = useState<string>("");
    const [descriptionDelta, setDescriptionDelta] = useState<any>(null);
    const [solutionDelta, setSolutionDelta] = useState<any>(null);
    const [quillLoaded, setQuillLoaded] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const quillDescriptionRef = useRef<any>(null);
    const quillSolutionRef = useRef<any>(null);

    // カテゴリー選択状態
    const [categoryIds, setCategoryIds] = useState<number[]>([]);

    // 編集前にパズルとカテゴリーを取得
    useEffect(() => {
        fetchInitialPuzzle(params.id).then((puzzle) => {
            if (!puzzle) {
                return;
            }
            setPuzzle(puzzle);
            const initialCategoryIds = puzzle.PuzzleCategory.map((pc) => pc.category.id);
            console.log("カテゴリーを取得しました: ", initialCategoryIds);
            setCategoryIds(initialCategoryIds);
        });
    }, [params.id]);

    useEffect(() => {
        if (puzzle?.description && !quillLoaded) {
            import('quill').then((Quill) => {
                const quill = new Quill.default(document.createElement('div'));
                const descriptionDelta = quill.clipboard.convert({ html: puzzle.description });
                const solutionDelta = quill.clipboard.convert({ html: puzzle.solution });
                setDescriptionDelta(descriptionDelta);
                setSolutionDelta(solutionDelta);
                setQuillLoaded(true);
            });
        }
        setTitle(puzzle?.title || "");
    }, [puzzle, quillLoaded]);

    if (!descriptionDelta) {
        return <div>Loading...</div>
    }

    // 削除確認ダイアログの開閉
    const toggleDeleteModal = () => {
        setIsDeleteModalOpen(!isDeleteModalOpen);
    };

    // カテゴリーを選択
    const handleCheckboxChange = (categoryIds: number[]) => {
        setCategoryIds(categoryIds);
    }

    return (
        <div>
            <button onClick={toggleDeleteModal}>
                {isDeleteModalOpen ? "削除確認ダイアログを閉じる" : "削除確認ダイアログを開く"}
            </button>
            <div className="fixed top-20 left-20" id="delete_modal"></div>
            {isDeleteModalOpen && (
                <Portal element={document.getElementById("delete_modal")!}>
                    <DeleteModal id={params.id ?? 0} onButtonClick={toggleDeleteModal} />
                </Portal>
            )}
            <p>タイトル</p>
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required/>
            <p>本文</p>
            <Editor
                ref={quillDescriptionRef}
                readOnly={false}
                defaultValue={descriptionDelta}
                onSelectionChange={setRange}
                onTextChange={setLastChange}
            />
            <p>解答</p>
            <Editor
                ref={quillSolutionRef}
                readOnly={false}
                defaultValue={solutionDelta}
                onSelectionChange={setRange}
                onTextChange={setLastChange}
            />
            {/* カテゴリー */}
            <CategoryCheckbox
                onChange={handleCheckboxChange}
                value={categoryIds}
            />
            {/* 内容を送信 */}
            <button type="button" onClick={() => send( params.id || "0", title, categoryIds, quillDescriptionRef, quillSolutionRef)}>
                Send
            </button>
        </div>
    );
}