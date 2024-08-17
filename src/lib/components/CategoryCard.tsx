import { Category } from "@prisma/client";
import { Box, Card } from "@mui/material";

type CategoryCardProps = {
    category: Category;
};

export default function CategoryCard({ category }: CategoryCardProps) {
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
        >
            <h2>{category.name}</h2>
        </Card>
    );
}