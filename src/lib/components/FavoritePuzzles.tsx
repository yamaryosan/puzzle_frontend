import { Puzzle } from "@prisma/client";
import PuzzleCard from "@/lib/components/PuzzleCard";
import { FavoriteOutlined } from "@mui/icons-material";
import RandomPuzzles from "@/lib/components/RandomPuzzles";

type props = {
    puzzles: Puzzle[];
    activeCardId: number | null;
    handleCardClick: (id: number) => void;
};

export default function FavoritePuzzles({
    puzzles,
    activeCardId,
    handleCardClick,
}: props) {
    return (
        <>
            <h2
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
                <FavoriteOutlined />
                お気に入りのパズル
            </h2>
            <ul>
                {puzzles.length === 0 ? (
                    <>
                        <p>お気に入りに登録してみましょう！</p>
                        <RandomPuzzles />
                    </>
                ) : (
                    puzzles?.map((puzzle) => (
                        <li key={puzzle.id}>
                            <PuzzleCard
                                puzzle={puzzle}
                                isActive={puzzle.id === activeCardId}
                                onClick={() => handleCardClick(puzzle.id)}
                            />
                        </li>
                    ))
                )}
            </ul>
        </>
    );
}
