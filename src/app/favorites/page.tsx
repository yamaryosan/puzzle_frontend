'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Puzzle } from '@prisma/client';
import { getFavoritePuzzles } from '@/lib/api/puzzleapi';
import PuzzleCard from '@/lib/components/PuzzleCard';

export default function Home() {
    const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
    // アクティブなカードのID
    const [activeCardId, setActiveCardId] = useState<number | null>(null);

    // パズル一覧を取得
    useEffect(() => {
        async function fetchPuzzles() {
            try {
                const puzzles = await getFavoritePuzzles();
                setPuzzles(puzzles);
            } catch (error) {
                console.error("パズルの取得に失敗: ", error);
            }
        }
        fetchPuzzles();
    }, []);

    if (!puzzles) {
        return <div>loading...</div>;
    }

    // カードのクリックイベント
    const handleCardClick = (id: number) => {
        setActiveCardId(id === activeCardId ? null : id);
    };
        
    return (
        <div>
            <ul>
                {puzzles?.map((puzzle) => (
                    <li key={puzzle.id}>
                        <PuzzleCard puzzle={puzzle} isActive={puzzle.id === activeCardId} onClick={() => handleCardClick(puzzle.id)} />
                    </li>
                ))}
            </ul>
        </div>
    );
}