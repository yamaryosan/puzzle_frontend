'use client';

import { useEffect, useState } from 'react';
import { Puzzle } from '@prisma/client';
import { getFavoritePuzzles } from '@/lib/api/puzzleapi';
import PuzzleCard from '@/lib/components/PuzzleCard';
import RecommendSignInDialog from '@/lib/components/RecommendSignInDialog';
import FirebaseUserContext from '@/lib/context/FirebaseUserContext';
import { useContext } from 'react';

export default function Home() {
    const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
    // アクティブなカードのID
    const [activeCardId, setActiveCardId] = useState<number | null>(null);
    const user = useContext(FirebaseUserContext);

    // パズル一覧を取得
    useEffect(() => {
        async function fetchPuzzles() {
            try {
                if (!user) return;
                const puzzles = await getFavoritePuzzles(user.uid ?? '') as Puzzle[];
                setPuzzles(puzzles);
            } catch (error) {
                console.error("パズルの取得に失敗: ", error);
            }
        }
        fetchPuzzles();
    }, [user, activeCardId]);

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