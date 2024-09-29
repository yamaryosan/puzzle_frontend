'use client';

import React, { useRef, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import FirebaseUserContext from '@/lib/context/FirebaseUserContext';
import { Puzzle, Hint } from '@prisma/client';
import { getPuzzleById } from '@/lib/api/puzzleapi';
import getHintsByPuzzleId from '@/lib/api/hintapi';
import Quill from 'quill';
import Delta from 'quill-delta';
import TitleEditor from '@/lib/components/TitleEditor';
import DescriptionEditor from '@/lib/components/DescriptionEditor';
import SolutionEditor from '@/lib/components/SolutionEditor';
import HintsEditor from '@/lib/components/HintsEditor';
import CategoryCheckbox from '@/lib/components/CategoryCheckbox';
import ApproachCheckbox from '@/lib/components/ApproachCheckbox';
import DifficultEditor from '@/lib/components/DifficultyEditor';
import { Upload, Clear, Delete } from '@mui/icons-material';
import CommonButton from '@/lib/components/common/CommonButton';
import Portal from '@/lib/components/Portal';
import DeleteModal from '@/lib/components/DeleteModal';
import { Box } from '@mui/material';
import DeviceTypeContext from '@/lib/context/DeviceTypeContext';

/**
 * 内容を送信
 * @param id パズルID
 * @param title タイトル
 * @param categoryIds カテゴリーID
 * @param approachIds 定石ID
 * @param descriptionRef 本文のQuillの参照
 * @param solutionRef 正答のQuillの参照
 * @param hintQuills ヒントのQuillの参照
 * @param difficulty 難易度
 */
async function send(
    id: string,
    title: string,
    categoryIds: number[],
    approachIds: number[],
    descriptionRef: React.RefObject<Quill | null>,
    solutionRef: React.RefObject<Quill | null>,
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
    if (!descriptionRef.current || !solutionRef.current) {
        console.error("Quillの参照が取得できません");
        return;
    }
    const descriptionHtml = descriptionRef.current.root.innerHTML;
    const solutionHtml = solutionRef.current.root.innerHTML;
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
    const hintHtmls = hintQuills.map((hintQuill) => hintQuill.current?.root.innerHTML ?? "");

    if (!hintHtmls) {
        console.error("ヒントの取得に失敗");
        return puzzle;
    }
    console.log(hintHtmls);
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

type Range = {
    index: number;
    length: number;
};

export default function PuzzleEditForm({ id }: { id: string }) {
    const user = useContext(FirebaseUserContext);
    const router = useRouter();

    const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
    const [hints, setHints] = useState<Hint[]>([]);

    const [title, setTitle] = useState<string>('');

    const [, setRange] = useState<Range | null>(null);
    const [, setLastChange] = useState<Delta | null>(null);
    const [descriptionDelta, setDescriptionDelta] = useState<Delta>();
    const [solutionDelta, setSolutionDelta] = useState<Delta>();
    const descriptionRef = useRef<Quill | null>(null);
    const solutionRef = useRef<Quill | null>(null);

    const hintRef1 = useRef<Quill | null>(null);
    const hintRef2 = useRef<Quill | null>(null);
    const hintRef3 = useRef<Quill | null>(null);
    const hintRefs = [hintRef1, hintRef2, hintRef3];
    const [hintsDelta, setHintsDelta] = useState<Delta[]>([]);

    const maxHints = 3;
    const [checkedCategories, setCheckedCategories] = useState<number[]>([]);
    const [approachIds, setApproachIds] = useState<number[]>([]);
    const [difficulty, setDifficulty] = useState<number>(0);

    const [isLoading, setIsLoading] = useState(true);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const deviceType = useContext(DeviceTypeContext);

    useEffect(() => {
        async function loadQuill() {
            // パズルを取得
            const puzzle = await getPuzzleById(id, user?.uid || '');
            if (!puzzle) {
                console.error("パズルが見つかりません");
                return;
            }
            console.log("パズルを取得しました: ", puzzle);
            setPuzzle(puzzle);
            setTitle(puzzle.title);
            setDifficulty(puzzle.difficulty);
            // 初期値を設定
            const quillModule = await import('quill');
            const Delta = quillModule.default.import('delta');
            const quill = new quillModule.default(document.createElement('div'));
            if (!puzzle.description || !puzzle.solution) {
                return;
            }
            const descriptionDelta = quill.clipboard.convert({ html: puzzle.description });
            const solutionDelta = quill.clipboard.convert({ html: puzzle.solution });
            setDescriptionDelta(new Delta(descriptionDelta.ops));
            setSolutionDelta(new Delta(solutionDelta.ops));
            setIsLoading(false);
        }
        loadQuill();
    }, [id, user]);

    // 編集前にヒントを取得
    useEffect(() => {
        if (!user) {
            return;
        }
        async function loadHints() {
            const hints = await getHintsByPuzzleId(id, user?.uid || '');
            if (!hints) {
                console.error("ヒントが見つかりません");
                return;
            }
            console.log("ヒントを取得しました: ", hints);
            setHints(hints);
            const initialHintHtmls = hints.map((hint) => hint.content);
            console.log("ヒントを取得しました: ", initialHintHtmls);
        }
        loadHints();
    }, [id, user]);

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
    }, [hints]);

    // 編集前に以前の内容を取得
    useEffect(() => {
        if (puzzle?.description) {
            import('quill').then((Quill) => {
                const quill = new Quill.default(document.createElement('div'));
                const descriptionDelta = quill.clipboard.convert({ html: puzzle.description });
                const solutionDelta = quill.clipboard.convert({ html: puzzle.solution });
                setDescriptionDelta(descriptionDelta);
                setSolutionDelta(solutionDelta);
            });
        }
        setTitle(puzzle?.title || "");
        setDifficulty(puzzle?.difficulty || 1);
    }, [puzzle]);

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
        const description = descriptionRef.current?.editor.delta.ops.map((op: any) => op.insert).join("");
        if (description?.trim() === "") {
            alert("問題文を入力してください");
            return;
        }
        const solution = solutionRef.current?.editor.delta.ops.map((op: any) => op.insert).join("");
        if (solution?.trim() === "") {
            alert("正答を入力してください");
            return;
        }

        const puzzle = await send(id || "0", title, checkedCategories, approachIds, descriptionRef, solutionRef, hintRefs, difficulty);
        if (puzzle) {
            router.push(`/puzzles/${puzzle.id}?edited=true`);
        }
    }

    // 削除確認ダイアログの開閉
    const toggleDeleteModal = () => {
        setIsDeleteModalOpen(!isDeleteModalOpen);
    };

    if (!Delta) {
        return <div>Loading...</div>
    }

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <>
        <div id="delete_modal"></div>
        {isDeleteModalOpen && (
            <Portal element={document.getElementById("delete_modal")!}>
                <DeleteModal target="puzzle" id={id ?? 0} onButtonClick={toggleDeleteModal} />
            </Portal>
        )}        
        <TitleEditor title={title} setTitle={setTitle} />

        <DescriptionEditor
        defaultValue={descriptionDelta}
        containerRef={descriptionRef}
        onSelectionChange={setRange}
        onTextChange={setLastChange} />

        <SolutionEditor
        defaultValue={solutionDelta}
        containerRef={solutionRef}
        onSelectionChange={setRange}
        onTextChange={setLastChange} />

        <HintsEditor
        refs={hintRefs}
        maxHints={maxHints}
        defaultValues={hintsDelta} />

        <CategoryCheckbox 
        userId={user?.uid || ""}
        onChange={handleCheckboxChange}
        puzzle_id="0"
        value={checkedCategories} />

        <ApproachCheckbox
        onChange={setApproachIds}
        puzzle_id="0"
        value={approachIds} />
        
        <DifficultEditor value={difficulty} onChange={setDifficulty} />

        {deviceType === 'mobile' && (
        <Box sx={{ 
            paddingY: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '2rem',
            width: '100%'}}>
            <CommonButton color="secondary" onClick={handleSendButton} width='100%'>
                <Upload />
                <span>編集完了</span>
            </CommonButton>
            <CommonButton color="error" onClick={toggleDeleteModal} width='100%'>
                <Delete />
                <span>削除</span>
            </CommonButton>
        </Box>
        )}

        {deviceType === 'desktop' && (
        <Box sx={{ 
            paddingY: '0.5rem',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%'}}>
            <CommonButton color="error" onClick={toggleDeleteModal} width='45%'>
                <Delete />
                <span>削除</span>
            </CommonButton>
            <CommonButton color="secondary" onClick={handleSendButton} width='45%'>
                <Upload />
                <span>編集完了</span>
            </CommonButton>
        </Box>
        )}
        </>
    )
}