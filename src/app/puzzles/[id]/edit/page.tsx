'use client';

import Link from 'next/link';
import Editor from '@/lib/components/Editor';
import { useEffect, useState, useRef } from 'react';
import { getPuzzleById } from '@/lib/api/puzzleapi';
import getHintsByPuzzleId from '@/lib/api/hintapi';
import { getApproachesByPuzzleId } from '@/lib/api/approachApi';
import { Puzzle, Hint, Approach } from '@prisma/client';
import Quill from 'quill';
import Portal from '@/lib/components/Portal';
import DeleteModal from '@/lib/components/DeleteModal';
import CategoryCheckbox from '@/lib/components/CategoryCheckbox';
import HintsEditor from '@/lib/components/HintsEditor';
import ApproachCheckbox from '@/lib/components/ApproachCheckbox';

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

type ApproachWithRelation = {
    id: number;
    puzzle_id: number;
    approach_id: number;
    approach: Approach;
};

/**
 * 内容を送信
 * @param id パズルID
 * @param title タイトル
 * @param categoryIds カテゴリーID
 * @param approachIds 定石ID
 * @param quillDescriptionRef 本文のQuillの参照
 * @param quillSolutionRef 正答のQuillの参照
 */
async function send(id: string, title: string, categoryIds: number[], approachIds: number[], quillDescriptionRef: React.RefObject<Quill | null>, quillSolutionRef: React.RefObject<Quill | null>): Promise<Puzzle | undefined> 
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
        body: JSON.stringify({ title, categoryIds, approachIds, descriptionHtml, solutionHtml, difficulty, is_favorite }),
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

/**
 * 編集前の定石を取得
 * @param id パズルID
 * @returns Promise<ApproachWithRelation[] | undefined> 定石
 */
async function fetchInitialApproaches(id: string): Promise<ApproachWithRelation[] | undefined> {
    try {
        const approaches = await getApproachesByPuzzleId(parseInt(id));
        if (!approaches) {
            console.error("定石が見つかりません");
            return;
        }
        console.log("fetchInitialApproachで定石を取得しました: ", approaches);
        return approaches as ApproachWithRelation[];
    } catch (error) {
        console.error("定石の取得に失敗: ", error);
    }
}

/**
 * 編集前のヒントを取得
 * @param id パズルID
 * @returns Promise<Hint[] | undefined> ヒント
 */
async function fetchInitialHints(id: string): Promise<Hint[] | undefined> {
    try {
        const hints = await getHintsByPuzzleId(id);
        if (!hints) {
            console.error("ヒントが見つかりません");
            return;
        }
        console.log("ヒントを取得しました: ", hints);
        return hints;
    } catch (error) {
        console.error("ヒントの取得に失敗: ", error);
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

    // ヒント群
    const maxHints = 3;
    const [hints, setHints] = useState<Hint[]>([]);
    const hintQuills = Array.from({length: maxHints}, () => useRef<Quill | null>(null));
    // const [hintsDelta, setHintsDelta] = Array.from({length: maxHints}, () => useState<any>(null));
    const [hintsDelta, setHintsDelta] = useState(Array(maxHints).fill(null));

    // カテゴリー選択状態
    const [categoryIds, setCategoryIds] = useState<number[]>([]);
    // 定石選択状態
    const [approachIds, setApproachIds] = useState<number[]>([]);

    // 編集前にパズル、カテゴリーを取得
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

    // 編集前に定石を取得
    useEffect(() => {
        function fetchInitialApproaches(id: string): Promise<ApproachWithRelation[] | undefined> {
            return getApproachesByPuzzleId(parseInt(id));
        }
        fetchInitialApproaches(params.id).then((approaches) => {
            if (!approaches) {
                return;
            }
            const initialApproachIds = approaches.map((a) => a.approach_id);
            console.log("定石を取得しました: ", initialApproachIds);
            setApproachIds(initialApproachIds);
        });
    }, [params.id]);

    // 編集前にヒントを取得
    useEffect(() => {
        fetchInitialHints(params.id).then((hints) => {
            if (!hints) {
                return;
            }
            setHints(hints);
            const initialHintHtmls = hints.map((hint) => hint.content);
            console.log("ヒントを取得しました: ", initialHintHtmls);
        });
    }, [params.id]);

    // 編集前に以前の本文と正答を取得
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

    // 編集前に以前のヒントを取得
    useEffect(() => {
        import('quill').then((Quill) => {
            const quill = new Quill.default(document.createElement('div'));
            const newHintsDelta = Array(maxHints).fill(null);

            hints.forEach((hint, index) => {
                const hintsDelta = quill.clipboard.convert({ html: hint.content });
                newHintsDelta[index] = hintsDelta;
            });

            setHintsDelta(newHintsDelta);
        });
    }, [hints, quillLoaded]);

    if (!descriptionDelta) {
        return <div>Loading...</div>
    }

    // 削除確認ダイアログの開閉
    const toggleDeleteModal = () => {
        setIsDeleteModalOpen(!isDeleteModalOpen);
    };

    // カテゴリーを選択
    const handleCategoriesChange = (categoryIds: number[]) => {
        setCategoryIds(categoryIds);
    }

    // 定石を選択
    const handleApproachesChange = (approachIds: number[]) => {
        setApproachIds(approachIds);
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
            {/* ヒント */}
            <p>ヒント</p>
            <HintsEditor
                maxHints={maxHints}
                defaultValues={hintsDelta}
                hintQuills={hintQuills}
            />
            {/* カテゴリー */}
            <CategoryCheckbox
                onChange={handleCategoriesChange}
                value={categoryIds}
            />
            {/* 定石 */}
            <ApproachCheckbox
                onChange={handleApproachesChange}
                value={approachIds}
            />
            
            {/* 内容を送信 */}
            <button type="button" onClick={() => send( params.id || "0", title, categoryIds, approachIds, quillDescriptionRef, quillSolutionRef)}>
                Send
            </button>
        </div>
    );
}