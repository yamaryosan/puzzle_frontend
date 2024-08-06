'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getPuzzles } from '@/lib/api/puzzleapi';

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

export default function Home() {
    const [puzzles, setPuzzles] = useState<PuzzleWithCategories[]>([]);
    const [desc, setDesc] = useState(false);

    // パズル一覧を取得
    useEffect(() => {
        async function fetchPuzzles() {
            try {
                const puzzles = await getPuzzles();
                setPuzzles(puzzles);
            } catch (error) {
                console.error("パズルの取得に失敗: ", error);
            }
        }
        fetchPuzzles();
    }, []);

    // カテゴリー別でパズルを並び替え
    const handleSortByCategory = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setDesc(!desc);
        const sortedPuzzles = [...puzzles].sort((a, b) => {
            if (desc) {
                return a.PuzzleCategory[0].category.name.localeCompare(b.PuzzleCategory[0].category.name);
            } else {
                return b.PuzzleCategory[0].category.name.localeCompare(a.PuzzleCategory[0].category.name);
            }
        });
        setPuzzles(sortedPuzzles);
    }

    if (!puzzles) {
    return <div>loading...</div>;
    }
    
    return (
        <div>
            <Link href="/puzzles/create">新しいパズルを作成</Link>
            <p>難易度で並び替え</p>
            <button onClick={handleSortByCategory}>カテゴリー別で並び替え</button>
            <p>ランダムに並び替え</p>
            <p>パズル一覧</p>
            <ul>
                {puzzles?.map((puzzle) => (
                    <li key={puzzle.id}>
                        <Link href={`/puzzles/${puzzle.id}`}>
                        {puzzle.PuzzleCategory[0] ? (
                        <p>{puzzle.title} - {puzzle.PuzzleCategory[0].category.name}</p>
                        ) : (
                        <p>{puzzle.title} - カテゴリー未設定</p>
                        )}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}