"use client";

import { Box, Card } from "@mui/material";
import PuzzleInfo from "@/lib/components/PuzzleInfo";
import { Puzzle } from "@prisma/client";
import FavoriteButton from "@/lib/components/FavoriteButton";
import CompletionStatusIcon from "@/lib/components/CompletionStatusIcon";
import { useContext } from "react";
import DeviceTypeContext from "@/lib/context/DeviceTypeContext";

type PuzzleCardProps = {
    puzzle: Puzzle;
    isActive: boolean;
    onClick: (e: React.MouseEvent) => void;
};

export default function PuzzleCard({
    puzzle,
    isActive,
    onClick,
}: PuzzleCardProps) {
    const deviceType = useContext(DeviceTypeContext);

    const handleFavoriteChange = (checked: boolean) => {
        puzzle.is_favorite = checked;
    };

    return (
        <Card
            variant="outlined"
            sx={{
                marginY: 1,
                padding: "1rem",
                cursor: "pointer",
                backgroundColor: isActive ? "#f0f0f0" : "white",
            }}
            onClick={onClick}
        >
            {deviceType === "desktop" && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <h2 style={{ display: "inline-block" }}>{puzzle.title}</h2>
                    <Box
                        sx={{
                            display: "flex",
                            gap: "1rem",
                            alignItems: "center",
                        }}
                    >
                        <CompletionStatusIcon isSolved={puzzle.is_solved} />
                        <FavoriteButton
                            initialChecked={puzzle.is_favorite}
                            puzzleId={puzzle.id.toString()}
                            onChange={handleFavoriteChange}
                        />
                    </Box>
                </Box>
            )}
            {deviceType === "mobile" && (
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <h2 style={{ display: "inline-block" }}>{puzzle.title}</h2>
                    <Box
                        sx={{
                            display: "flex",
                            gap: "1rem",
                            alignItems: "center",
                            justifyContent: "flex-end",
                        }}
                    >
                        <CompletionStatusIcon isSolved={puzzle.is_solved} />
                        <FavoriteButton
                            initialChecked={puzzle.is_favorite}
                            puzzleId={puzzle.id.toString()}
                            onChange={handleFavoriteChange}
                        />
                    </Box>
                </Box>
            )}
            <Box
                sx={{
                    maxHeight: isActive ? "6000px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.5s ease-in-out",
                }}
            >
                <PuzzleInfo puzzle={puzzle} />
            </Box>
        </Card>
    );
}
