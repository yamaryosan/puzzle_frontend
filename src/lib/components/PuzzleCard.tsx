import Link from "next/link";
import { Box, Card } from "@mui/material";
import { useState } from "react";
import PuzzleInfo from "@/lib/components/PuzzleInfo";
import { Puzzle } from "@prisma/client";

type PuzzleCardProps = {
    puzzle: Puzzle;
    isActive: boolean;
    onClick: () => void;
};

export default function PuzzleCard({ puzzle, isActive, onClick }: PuzzleCardProps) {
    
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
            <h2>{puzzle.title}</h2>
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