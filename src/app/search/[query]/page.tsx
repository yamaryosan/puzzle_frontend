'use client';

import { useState, useEffect } from "react";
import { searchPuzzles } from "@/lib/api/puzzleapi";
import { Puzzle } from "@prisma/client";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { useContext } from "react";
import SearchResult from "@/lib/components/SearchResult";

export default function Page({ params }: { params: { query: string } }) {
    const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
    const user = useContext(FirebaseUserContext);

    const decodedQuery = decodeURIComponent(params.query).replace(/\+/g, " ");
   
    // アクティブなカードのID
    const [activeCardId, setActiveCardId] = useState<number | null>(null);

    useEffect(() => {
        async function fetchPuzzles() {
            try {
                if (!user) return;
                const puzzles = await searchPuzzles(decodedQuery, user.uid ?? '') as Puzzle[];
                setPuzzles(puzzles);
            } catch (error) {
                console.error("検索に失敗: ", error);
            }
        }
        fetchPuzzles();
    }, [params.query, user, activeCardId, decodedQuery]);

    if (!puzzles) {
        return <div>loading...</div>;
    }
    
    // カードのクリックイベント
    const handleCardClick = (id: number) => {
        setActiveCardId(id === activeCardId ? null : id);
    };

    return (<SearchResult decodedQuery={decodedQuery} puzzles={puzzles} activeCardId={activeCardId} handleCardClick={handleCardClick} />);
}