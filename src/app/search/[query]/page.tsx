'use client';

import { Box, List, ListItem } from "@mui/material";
import { useState, useEffect } from "react";
import { searchPuzzles } from "@/lib/api/puzzleapi";
import { Puzzle } from "@prisma/client";
import PuzzleCard from "@/lib/components/PuzzleCard";

export default function Page({ params }: { params: { query: string } }) {
    const [puzzles, setPuzzles] = useState<Puzzle[]>([]);

    const decodedQuery = decodeURIComponent(params.query);
    const sanitizedQuery = decodedQuery.replace(/\+/g, " ");
   
    // アクティブなカードのID
    const [activeCardId, setActiveCardId] = useState<number | null>(null);

    useEffect(() => {
        async function fetchPuzzles() {
            try {
                const puzzles = await searchPuzzles(decodedQuery);
                setPuzzles(puzzles);
            } catch (error) {
                console.error("検索に失敗: ", error);
            }
        }
        fetchPuzzles();
    }, [params.query]);

    if (!puzzles) {
        return <div>loading...</div>;
    }
    
    // カードのクリックイベント
    const handleCardClick = (id: number) => {
        setActiveCardId(id === activeCardId ? null : id);
    };

    return (
        <>
        <h2>{`"${sanitizedQuery}" の検索結果`}</h2>
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