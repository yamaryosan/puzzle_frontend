import { Puzzle } from "@prisma/client";
import { List } from "@mui/material";
import { Search } from "@mui/icons-material";
import PuzzleCard from "@/lib/components/PuzzleCard";

type SearchResultProps = {
    decodedQuery: string;
    puzzles: Puzzle[];
    activeCardId: number | null;
    handleCardClick: (id: number) => void;
};

export default function SearchResult({ decodedQuery, puzzles, activeCardId, handleCardClick }: SearchResultProps) {
    return (
        <>
        <h2 style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
            <Search />
            {`"${decodedQuery}" の検索結果`}
        </h2>
        <List>
            {puzzles?.map((puzzle) => (
                <li key={puzzle.id} >
                    <PuzzleCard puzzle={puzzle} isActive={puzzle.id === activeCardId} onClick={() => handleCardClick(puzzle.id)} />
                </li>
            ))}
        </List>
        </>
    );
}