'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getPuzzles } from '@/lib/api/puzzleapi';
import { Puzzle } from '@prisma/client';
import { Sort, Shuffle, AddCircleOutline } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import MessageModal from '@/lib/components/MessageModal';
import FirebaseUserContext from '@/lib/context/FirebaseUserContext';
import { useContext } from 'react';
import CommonButton from '@/lib/components/common/CommonButton';
import PuzzleCards from '@/lib/components/PuzzleCards';

export default function Puzzles() {
    const user = useContext(FirebaseUserContext);
    const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
    const [desc, setDesc] = useState(false);
    
    // アクティブなカードのID
    const [activeCardId, setActiveCardId] = useState<number | null>(null);

    // メッセージモーダルの表示
    const searchParams = useSearchParams();
    const showDeletedModal = searchParams.get('deleted') === 'true';

    // パズル一覧を取得
    useEffect(() => {
        async function fetchPuzzles() {
            if (!user) return;
            try {
                const puzzles = await getPuzzles(user.uid || "");
                setPuzzles(puzzles);
            } catch (error) {
                console.error("パズルの取得に失敗: ", error);
            }
        }
        fetchPuzzles();
        return () => {
            setPuzzles([]);
        }
    }, [user]);

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

    // カードのクリックイベント
    const handleCardClick = (id: number) => {
        setActiveCardId(id === activeCardId ? null : id);
    };
    
    return (
        <>
        {showDeletedModal && (
            <MessageModal message="パズルを削除しました" param="deleted" />
        )}
        <div>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Link href="/puzzles/create" style={{display: "block", width: "30%"}}>
                    <CommonButton color="secondary" onClick={() => {}}>
                        <AddCircleOutline />
                        パズル作成
                    </CommonButton>
                </Link>
                <CommonButton color="secondary" onClick={handleSort} width="30%">
                    <Sort />
                    難易度ソート
                </CommonButton>
                <CommonButton color="secondary" onClick={handleShuffle} width="30%">
                    <Shuffle />
                    シャッフル
                </CommonButton>
            </Box>
            <PuzzleCards puzzles={puzzles} activeCardId={activeCardId} handleCardClick={handleCardClick} />
        </div>
    </>
    );
}