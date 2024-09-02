'use client';

import { useEffect, useState } from 'react';
import { Puzzle } from '@prisma/client';
import { getFavoritePuzzles } from '@/lib/api/puzzleapi';
import PuzzleCard from '@/lib/components/PuzzleCard';
import useAuth from '@/lib/hooks/useAuth';
import RecommendSignInDialog from '@/lib/components/RecommendSignInDialog';

export default function Home() {
    const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
    // アクティブなカードのID
    const [activeCardId, setActiveCardId] = useState<number | null>(null);
    const { user, userId } = useAuth();

    // パズル一覧を取得
    useEffect(() => {
        async function fetchPuzzles() {
            try {
                if (!userId) return;
                const puzzles = await getFavoritePuzzles(userId ?? '') as Puzzle[];
                setPuzzles(puzzles);
            } catch (error) {
                console.error("パズルの取得に失敗: ", error);
            }
        }
        fetchPuzzles();
    }, [userId, activeCardId]);

    // カードのクリックイベント
    const handleCardClick = (id: number) => {
        setActiveCardId(id === activeCardId ? null : id);
    };
        
    return (
        <>
        {user ? (
        <div>
            <ul>
                {puzzles.length === 0 ?
                (<p>お気に入りのパズルがありません</p>
                ) : (
                    puzzles?.map((puzzle) => (
                        <li key={puzzle.id}>
                            <PuzzleCard puzzle={puzzle} isActive={puzzle.id === activeCardId} onClick={() => handleCardClick(puzzle.id)} />
                        </li>
                    ))
                )}
            </ul>
        </div>
        ) : (
            <div>
                <RecommendSignInDialog />
            </div>
        )}
        </>
    );
}