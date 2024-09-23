'use client';

import { useEffect, useState } from 'react';
import { Puzzle } from '@prisma/client';
import { getFavoritePuzzles } from '@/lib/api/puzzleapi';
import FirebaseUserContext from '@/lib/context/FirebaseUserContext';
import { useContext } from 'react';
import FavoritePuzzles from '@/lib/components/FavoritePuzzles';

export default function Page() {
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
        
    return (<FavoritePuzzles puzzles={puzzles} activeCardId={activeCardId} handleCardClick={handleCardClick} />);
}