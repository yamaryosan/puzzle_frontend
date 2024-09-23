import PuzzleCard from '@/lib/components/PuzzleCard';
import { Puzzle } from '@prisma/client';

type props = {
    puzzles: Puzzle[];
    activeCardId: number | null;
    handleCardClick: (id: number) => void;
}

export default function PuzzleCards({ puzzles, activeCardId, handleCardClick }: props) {
    return (
        <>
        { puzzles.length === 0 && <p>最初のパズルを作成しましょう！</p> }
        <ul>
            {puzzles?.map((puzzle) => (
                <li key={puzzle.id}>
                    <PuzzleCard puzzle={puzzle} isActive={puzzle.id === activeCardId} onClick={() => handleCardClick(puzzle.id)} />
                </li>
            ))}
        </ul>        
        </>
    )
}