'use client';

import { List } from "@mui/material";
import { useState, useEffect } from "react";
import { searchPuzzles } from "@/lib/api/puzzleapi";
import { Puzzle } from "@prisma/client";
import PuzzleCard from "@/lib/components/PuzzleCard";
import useAuth from "@/lib/hooks/useAuth";

export default function Page({ params }: { params: { query: string } }) {
    const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
    const { user, userId } = useAuth();

    const decodedQuery = decodeURIComponent(params.query).replace(/\+/g, " ");
   
    // アクティブなカードのID
    const [activeCardId, setActiveCardId] = useState<number | null>(null);

    useEffect(() => {
        async function fetchPuzzles() {
            try {
                const puzzles = await searchPuzzles(decodedQuery, userId ?? '') as Puzzle[];
                setPuzzles(puzzles);
            } catch (error) {
                console.error("検索に失敗: ", error);
            }
        }
        fetchPuzzles();
    }, [params.query, userId, activeCardId]);

    if (!puzzles) {
        return <div>loading...</div>;
    }
    
    // カードのクリックイベント
    const handleCardClick = (id: number) => {
        setActiveCardId(id === activeCardId ? null : id);
    };

    return (
        <>
        <h2>{`"${decodedQuery}" の検索結果`}</h2>
        <List>
            {puzzles?.map((puzzle) => (
                <li key={puzzle.id} >
                    <PuzzleCard puzzle={puzzle} isActive={puzzle.id === activeCardId} onClick={() => handleCardClick(puzzle.id)} />
                </li>
            ))}
        </List>
        </>
    )
}