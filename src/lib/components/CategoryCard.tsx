import { Category } from "@prisma/client";
import { Box, Card } from "@mui/material";
import CategoryInfo from "@/lib/components/CategoryInfo";
import { useState } from "react";

type CategoryCardProps = {
    category: Category;
    isActive: boolean;
    onClick: () => void;
};

export default function CategoryCard({ category, isActive, onClick }: CategoryCardProps) {
    
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
            onClick={onClick}>
                <CategoryInfo category={category} isActive={isActive} />
        </Card>
    );
}