import Link from "next/link";
import { Card } from "@mui/material";
import { useState } from "react";
import PuzzleInfoModal from "@/lib/components/PuzzleInfoModal";
import { createPortal } from "react-dom";
import { Puzzle } from "@prisma/client";

type PuzzleCardProps = {
    puzzle: Puzzle;
};

export default function PuzzleCard({ puzzle }: PuzzleCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <Link href={`/puzzles/${puzzle.id}`}>
            <Card variant="outlined"
                sx={{
                    marginY: 1,
                    padding: "1rem",
                    ":hover": {
                        backgroundColor: "secondary.light",
                    },
                    cursor: "pointer",
                    position: "relative",
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <h2>{puzzle.title}</h2>
                {isHovered && createPortal(<PuzzleInfoModal puzzle={puzzle} />, document.body)}
            </Card>
        </Link>
    );
}