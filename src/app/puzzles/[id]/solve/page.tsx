'use client';

import { useState, useEffect } from "react";
import { Puzzle } from "@prisma/client";
import { getPuzzleById } from "@/lib/api/puzzleapi";

export default function Page({ params }: { params: { id: string } }) {
    const [puzzle, setPuzzle] = useState<Puzzle | null>(null);

    // パズルを取得
    useEffect(() => {
        async function fetchPuzzle() {
            const puzzle = await getPuzzleById(params.id);
            // setPuzzle(puzzle);
        }
        fetchPuzzle();
    }, []);

    return (
        <p>解く</p>
    )
}