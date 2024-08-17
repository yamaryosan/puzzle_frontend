import { Category, Puzzle } from "@prisma/client";
import Link from "next/link";
import { Button, Box } from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { fetchPuzzlesByCategoryId } from "@/lib/api/categoryapi";

type CategoryInfoProps = {
    category: Category;
    isActive: boolean;
};

export default function CategoryInfo({ category, isActive }: CategoryInfoProps) {

    const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
    }

    return (
        <>
        {isActive && (
            <Button onClick={handleEditClick}>
                <Edit />
            </Button>
        )}
        <Box sx={{
            maxHeight: isActive ? '1000px' : '0px',
            overflow: 'hidden',
            transition: 'max-height 0.5s ease-in-out',
        }}>
        </Box>        
        <Box sx={{
            padding: "1rem",
        }}>
        </Box>
        </>
    );
}