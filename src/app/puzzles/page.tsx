'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getPuzzles } from '@/lib/api/puzzleapi';
import { Puzzle, Category } from '@prisma/client';
import PuzzleCard from '@/lib/components/PuzzleCard';
import { Sort, Shuffle, AddCircleOutline } from '@mui/icons-material';
import { Box } from '@mui/material';
import useAuth from '@/lib/hooks/useAuth';
import RecommendSignInDialog from '@/lib/components/RecommendSignInDialog';

export default function Page() {
    const { user, userId } = useAuth();
    const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
    const [desc, setDesc] = useState(false);
    
    // アクティブなカードのID
    const [activeCardId, setActiveCardId] = useState<number | null>(null);

    // パズル一覧を取得
    useEffect(() => {
        async function fetchPuzzles() {
            if (userId == null) return;
            try {
                const puzzles = await getPuzzles(userId || "");
                setPuzzles(puzzles);
            } catch (error) {
                console.error("パズルの取得に失敗: ", error);
            }
        }
        fetchPuzzles();
        return () => {
            setPuzzles([]);
        }
    }, [userId]);

    // 難易度でソート
    const handleSort = () => {
        setPuzzles(prevPuzzles => {
            const sortedPuzzles = [...prevPuzzles].sort((a, b) => {
                if (desc) {
                    return a.difficulty - b.difficulty;
                } else {
                    return b.difficulty - a.difficulty;
                }
            });
            return sortedPuzzles;
        });
        setDesc(!desc);
    };

    // ランダムにシャッフル
    const handleShuffle = () => {
        setPuzzles(prevPuzzles => {
            // 新しい配列を作成してシャッフル
            const shuffled = [...prevPuzzles];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        });
    };

    if (!puzzles) {
    return <div>loading...</div>;
    }

    // カードのクリックイベント
    const handleCardClick = (id: number) => {
        setActiveCardId(id === activeCardId ? null : id);
    };
    
    return (
        <>
        { user ? (
        <div>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Link href="/puzzles/create" className="flex items-center w-full bg-secondary-light hover:bg-secondary-dark">
                    <Box sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "center", paddingY: "1rem", marginX: "0.5rem"}}>
                        <AddCircleOutline /> 
                        <p>パズル作成</p>
                    </Box>
                </Link>
                <Box sx={{ 
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    justifyContent: "center",
                    marginX: "0.5rem",
                    backgroundColor: "secondary.light",
                    ":hover": {
                        backgroundColor: "secondary.dark"
                    }
                    }}>
                    <button onClick={handleSort} className="block py-4 w-full flex justify-center">
                        <Sort />
                        <span>難易度ソート</span>
                    </button>
                </Box>
                <Box sx={{ 
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    justifyContent: "center",
                    marginX: "0.5rem",
                    backgroundColor: "secondary.light",
                    ":hover": {
                        backgroundColor: "secondary.dark"
                    }
                    }}>
                    <button onClick={handleShuffle} className="block py-4 w-full flex justify-center">
                        <Shuffle />
                        <span>シャッフル</span>
                    </button>
                </Box>
            </Box>
            { puzzles.length === 0 && <p>最初のパズルを作成しましょう！</p> }
            <ul>
                {puzzles?.map((puzzle) => (
                    <li key={puzzle.id}>
                        <PuzzleCard puzzle={puzzle} isActive={puzzle.id === activeCardId} onClick={() => handleCardClick(puzzle.id)} />
                    </li>
                ))}
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