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
import DifficultEditor from '@/lib/components/DifficultyEditor';
import { Edit, Upload, Delete, Clear } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import useAuth from '@/lib/hooks/useAuth';

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
 * @param hintQuills ヒントのQuillの参照
 * @param difficulty 難易度
 */
async function send(
    id: string,
    title: string,
    categoryIds: number[],
    approachIds: number[],
    quillDescriptionRef: React.RefObject<Quill | null>,
    quillSolutionRef: React.RefObject<Quill | null>,
    hintQuills:React.RefObject<Quill | null>[],
    difficulty: number): Promise<Puzzle | undefined> 
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

    // カテゴリーを更新
    const puzzleId = puzzle.id;
    const categoryResponse = await fetch(`/api/puzzles/${puzzleId}/categories`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryIds }),
    });
    if (!categoryResponse.ok) {
        const error = await categoryResponse.json();
        console.error("カテゴリーの更新に失敗: ", error);
    }
    console.log("カテゴリーの更新に成功");

    // 定石を更新
    const approachResponse = await fetch(`/api/puzzles/${puzzleId}/approaches`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ approachIds }),
    });
    if (!approachResponse.ok) {
        const error = await approachResponse.json();
        console.error("定石の更新に失敗: ", error);
    }
    console.log("定石の更新に成功");

    // ヒントを更新
    const hintHtmls = hintQuills.map((hintQuill) => hintQuill.current?.root.innerHTML);

    if (!hintHtmls) {
        console.error("ヒントの取得に失敗");
        return puzzle;
    }
    const hintsResponse = await fetch(`/api/puzzles/${puzzleId}/hints`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ hintHtmls }),
    });
    if (!hintsResponse.ok) {
        const error = await hintsResponse.json();
        console.error("ヒントの更新に失敗: ", error);
    }
    console.log("ヒントの更新に成功");
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
    // 難易度
    const [difficulty, setDifficulty] = useState<number>(1);
    // ユーザ情報
    const { userId } = useAuth();

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

    // 編集前に以前のヒント内容を取得
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

    // 編集前に以前の内容を取得
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
        setDifficulty(puzzle?.difficulty || 1);
    }, [puzzle, quillLoaded]);

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
        <>
        <Box 
        sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            padding: '1rem',
        }}>
            <div id="delete_modal"></div>
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
            sx={{ paddingY: '0.5rem' }}>
                <TitleEditor title={title} setTitle={setTitle} />
            </Box>
            <Box
            sx={{ paddingY: '0.5rem' }}>
                <h3>問題文</h3>
                <Editor
                    ref={quillDescriptionRef}
                    readOnly={false}
                    defaultValue={descriptionDelta}
                    onSelectionChange={setRange}
                    onTextChange={setLastChange}/>
            </Box>
            <Box sx={{ paddingY: '0.5rem' }}>
                <h3>正答</h3>
                <Editor
                    ref={quillSolutionRef}
                    readOnly={false}
                    defaultValue={solutionDelta}
                    onSelectionChange={setRange}
                    onTextChange={setLastChange}/>
            </Box>
            <Box sx={{ paddingY: '0.5rem' }}>
                <h3>ヒント</h3>
                <HintsEditor
                    maxHints={maxHints}
                    defaultValues={hintsDelta}
                    hintQuills={hintQuills}/>
            </Box>
            <Box sx={{ paddingY: '0.5rem' }}>
                <h3>カテゴリー</h3>
                <CategoryCheckbox
                userId={userId || ""}
                onChange={handleCategoriesChange}
                puzzle_id={params.id || "0"}
                value={categoryIds}/>
            </Box>
            {/* 定石 */}
            <Box sx={{ paddingY: '0.5rem' }}>
                <h3>定石</h3>
                <ApproachCheckbox
                    onChange={handleApproachesChange}
                    puzzle_id={params.id || "0"}
                    value={approachIds}/>
            </Box>

            <Box sx={{ paddingY: '0.5rem' }} >
                <h3>難易度</h3>
                <DifficultEditor value={difficulty} onChange={setDifficulty} />
            </Box>

            <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingY: '1rem',
                marginY: '1rem',
            }}>
                <Button 
                sx={{
                    padding: '1.5rem',
                    backgroundColor: 'secondary.light',
                    width: '20%',
                    ":hover": {
                        backgroundColor: 'secondary.main',
                    }
                }}
                onClick={() => send(params.id || "0", title, categoryIds, approachIds, quillDescriptionRef, quillSolutionRef, hintQuills, difficulty)}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', scale: "1.8", color: "black" }}>
                        <Upload />
                        <span>編集完了</span>
                    </Box>
                </Button>
                <Button
                sx={{
                    padding: '1.5rem',
                    backgroundColor: 'error.light',
                    width: '20%',
                    ":hover": {
                        backgroundColor: 'error.main',
                    },
                }}
                onClick={toggleDeleteModal}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', scale: "1.4", color: "black" }}>
                        {isDeleteModalOpen ? <Clear /> : <Delete />}
                    </Box>
                </Button>
            </Box>
        </Box>
        </>
    );
}