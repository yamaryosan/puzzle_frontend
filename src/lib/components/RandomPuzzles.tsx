import { useState, useEffect, useContext } from "react";
import { puzzles } from "@prisma/client";
import { getRandomPuzzles } from "@/lib/api/puzzleapi";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import PuzzleCards from "@/lib/components/PuzzleCards";

export default function RandomPuzzles() {
    const [puzzles, setPuzzles] = useState<puzzles[]>([]);
    const [activeCardId, setActiveCardId] = useState<number | null>(null);
    const user = useContext(FirebaseUserContext);

    useEffect(() => {
        async function fetchPuzzles() {
            try {
                if (!user) return;
                const puzzles = (await getRandomPuzzles(
                    user.uid ?? "",
                    "3"
                )) as puzzles[];
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
