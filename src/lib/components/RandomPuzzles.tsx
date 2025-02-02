import { useState, useEffect, useContext } from "react";
import { Puzzle } from "@prisma/client";
import { getRandomPuzzles } from "@/lib/api/puzzleapi";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import PuzzleCards from "@/lib/components/PuzzleCards";

export default function RandomPuzzles() {
    const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
    const [activeCardId, setActiveCardId] = useState<number | null>(null);
    const user = useContext(FirebaseUserContext);

    useEffect(() => {
        async function fetchPuzzles() {
            try {
                if (!user) return;
                const puzzles = (await getRandomPuzzles(
                    user.uid ?? "",
                    "3"
                )) as Puzzle[];
                setPuzzles(puzzles);
            } catch (error) {
                console.error("パズルの取得に失敗: ", error);
            }
        }
        fetchPuzzles();
    }, [user, activeCardId]);

    const handleCardClick = (id: number) => {
        setActiveCardId(id === activeCardId ? null : id);
    };

    return (
        <PuzzleCards
            puzzles={puzzles}
            activeCardId={activeCardId}
            handleCardClick={handleCardClick}
        />
    );
}
