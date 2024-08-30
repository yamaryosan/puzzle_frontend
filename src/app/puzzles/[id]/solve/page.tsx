'use client';

import { useState, useEffect, useRef } from "react";
import { Puzzle } from "@prisma/client";
import Viewer from "@/lib/components/Viewer";
import Editor from "@/lib/components/Editor";
import { getPuzzleById } from "@/lib/api/puzzleapi";
import Quill from "quill";
import { Approach, Category } from "@prisma/client";
import { getApproachesByPuzzleId } from "@/lib/api/approachApi";
import { getCategoriesByPuzzleId } from "@/lib/api/categoryapi";
import { useRouter } from "next/navigation";
import { Box, Button } from "@mui/material";
import { Send } from "@mui/icons-material";
import HintsViewer from "@/lib/components/HintsViewer";

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
    return puzzle as Puzzle;
}

export default function Page({ params }: { params: { id: string } }) {
    const router = useRouter();

    const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
    const [answer, setAnswer] = useState<string>('');
    const [range, setRange] = useState<Range>();
    const [lastChange, setLastChange] = useState<Change | null>(null);

    const answerRef = useRef<Quill | null>(null);

    const [categories, setCategories] = useState<Category[] | null>(null);

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

    // 定石を取得
    useEffect(() => {
        async function fetchApproaches() {
            const approaches = await getApproachesByPuzzleId(params.id) as ApproachWithRelation[];
            setApproaches(approaches ? approaches.map(approach => approach.approach) : []);
        }
        fetchApproaches();
    }, []);

    // 送信
    const handleSend = async () => {
        const puzzle = await send(params.id, answerRef);
        if (puzzle) {
            router.push(`/puzzles/${params.id}/check-answer`);
        }
    }

    if (!puzzle) {
        return <div>loading...</div>;
    }

    return (
        <Box
        sx={{
            padding: "1rem",
            backgroundColor: "white",
            borderRadius: "5px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
        }}>
            <h2>「{puzzle.title}」の解答画面</h2>
            <Box
            sx={{
                display: "flex",
                alignItems: "center",
                paddingY: "0.5rem",
            }}>
                <h3>カテゴリー: </h3>
                <span>{categories?.map(category => (
                    <span key={category.id}>{category.name} </span>
                ))}</span>
            </Box>
            
            <Box sx={{ paddingY: '0.5rem' }}>
                <h3>問題文</h3>
                <Viewer
                    readOnly={true}
                    defaultValue={puzzle.description}/>
            </Box>

            <Box sx={{ paddingY: '0.5rem' }}>
                <HintsViewer puzzleId={params.id} />
            </Box>

            <Box sx={{ paddingY: '0.5rem' }}>
                <h3>定石</h3>
                {approaches?.length === 0 && <p>定石はありません</p>}
                {approaches?.map((approach, index) => (
                    <Box key={approach.id} sx={{ paddingY: '0.5rem' }}>
                        <h4>{`定石${index + 1} : ${approach.title}`}</h4>
                        <Viewer
                            readOnly={true}
                            defaultValue={approach.content}/>
                    </Box>
                ))}
            </Box>
            <Box sx={{ paddingY: '0.5rem' }}>
                <h3>回答を入力</h3>
                <Editor
                ref={answerRef}
                readOnly={false}
                defaultValue={answer}
                onTextChange={setLastChange}
                onSelectionChange={setRange}/>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button 
                sx={{
                    padding: '1.5rem',
                    backgroundColor: 'secondary.light',
                    width: '20%',
                    ":hover": {
                        backgroundColor: 'secondary.main',
                    }
                }}
                onClick={() => handleSend()}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', scale: "1.8", color: "black" }}>
                    <Send />
                    <span>解答を送信</span>
                    </Box>
                </Button>
            </Box>
        </Box>
    )
}