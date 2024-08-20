import Link from "next/link";
import { Box, Card } from "@mui/material";
import { useState } from "react";
import PuzzleInfo from "@/lib/components/PuzzleInfo";
import { Puzzle } from "@prisma/client";
import FavoriteButton from "@/lib/components/FavoriteButton";

type PuzzleCardProps = {
    puzzle: Puzzle;
    isActive: boolean;
    onClick: (e: React.MouseEvent) => void;
};

export default function PuzzleCard({ puzzle, isActive, onClick }: PuzzleCardProps) {

    const handleFavoriteChange = (checked: boolean) => {
        puzzle.is_favorite = checked;
    };
    
    return (
        <Card variant="outlined"
            sx={{
                marginY: 1,
                padding: "1rem",
                cursor: "pointer",
                ":hover": {
                    backgroundColor: "secondary.light",
                    transition: "background-color 0.3s",
                },
            }}
            onClick={onClick}
        >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{display: "inline-block"}}>{puzzle.title}</h2>
                    <FavoriteButton
                        checked={puzzle.is_favorite}
                        puzzleId={puzzle.id.toString()}
                        onChange={handleFavoriteChange}
                        />
            </Box>
            <Box sx={{
                maxHeight: isActive ? '1000px' : '0px',
                overflow: 'hidden',
                transition: 'max-height 0.5s ease-in-out',
            }}>
                <PuzzleInfo puzzle={puzzle} />
            </Box>
        </Card>
    );
}