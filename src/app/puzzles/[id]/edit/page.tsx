'use client';

import Link from 'next/link';
import Editor from '@/lib/components/Editor';
import { useEffect, useState, useRef } from 'react';
import { getPuzzleById } from '@/lib/api/puzzleapi';
import getHintsByPuzzleId from '@/lib/api/hintapi';

import { Puzzle, Hint } from '@prisma/client';
import Quill from 'quill';
import Portal from '@/lib/components/Portal';
import DeleteModal from '@/lib/components/DeleteModal';
import CategoryCheckbox from '@/lib/components/CategoryCheckbox';
import HintsEditor from '@/lib/components/HintsEditor';
import ApproachCheckbox from '@/lib/components/ApproachCheckbox';
import TitleEditor from '@/lib/components/TitleEditor';
import { Edit, Upload } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

type PageParams = {
    id: string;
};

type Change = {
    ops: any[];
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
 * @returns Promise<Puzzle | undefined> パズル
 */
async function fetchInitialPuzzle(id: string): Promise<Puzzle | undefined> {
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
    const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
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

    // 編集前にパズルを取得
    useEffect(() => {
        fetchInitialPuzzle(params.id).then((puzzle) => {
            if (!puzzle) {
                return;
            }
            setPuzzle(puzzle);
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
        <Box 
        sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            padding: '1rem',
        }}>
            <button onClick={toggleDeleteModal}>
                {isDeleteModalOpen ? "削除確認ダイアログを閉じる" : "削除確認ダイアログを開く"}
            </button>
            <div className="fixed top-20 left-20" id="delete_modal"></div>
            {isDeleteModalOpen && (
                <Portal element={document.getElementById("delete_modal")!}>
                    <DeleteModal id={params.id ?? 0} onButtonClick={toggleDeleteModal} />
                </Portal>
            )}
            <h2>
                <Edit />
                <span>パズル編集</span>
            </h2>
            <Box
            sx={{
                paddingY: '0.5rem',
            }}>
                <TitleEditor title={title} setTitle={setTitle} />
            </Box>
            <Box
            sx={{
                paddingY: '0.5rem',
            }}>
                <h3>問題文</h3>
                <Editor
                    ref={quillDescriptionRef}
                    readOnly={false}
                    defaultValue={descriptionDelta}
                    onSelectionChange={setRange}
                    onTextChange={setLastChange}
                />
            </Box>
            <Box
            sx={{
                paddingY: '0.5rem',
            }}>
                <h3>正答</h3>
                <Editor
                    ref={quillSolutionRef}
                    readOnly={false}
                    defaultValue={solutionDelta}
                    onSelectionChange={setRange}
                    onTextChange={setLastChange}
                />
            </Box>
            <Box
            sx={{
                paddingY: '0.5rem',
            }}>
                <h3>ヒント</h3>
                <HintsEditor
                    maxHints={maxHints}
                    defaultValues={hintsDelta}
                    hintQuills={hintQuills}
                />
            </Box>
            <Box
            sx={{
                paddingY: '0.5rem',
            }}>
                <h3>カテゴリー</h3>
                <CategoryCheckbox
                onChange={handleCategoriesChange}
                puzzle_id={params.id || "0"}
                value={categoryIds}
            />
            </Box>
            {/* 定石 */}
            <Box
            sx={{
                paddingY: '0.5rem',
            }}>
                <h3>定石</h3>
                <ApproachCheckbox
                    onChange={handleApproachesChange}
                    puzzle_id={params.id || "0"}
                    value={approachIds}
                />
            </Box>
            
            {/* 内容を送信 */}
            <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                paddingY: '1rem',
                marginY: '1rem',
            }}>
                <Button 
                sx={{
                    padding: '1.5rem',
                    backgroundColor: 'secondary.light',
                    width: '100%',
                    ":hover": {
                        backgroundColor: 'secondary.main',
                    }
                }}
                onClick={() => send(params.id || "0", title, categoryIds, approachIds, quillDescriptionRef, quillSolutionRef)}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', scale: "1.8", color: "black" }}>
                    <Upload />
                    <span>編集を終了</span>
                    </Box>
                </Button>
            </Box>
        </Box>
    );
}