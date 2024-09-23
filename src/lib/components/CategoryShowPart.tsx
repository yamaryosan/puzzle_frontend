import Box from '@mui/material/Box';
import { Category } from '@prisma/client';

export default function CategoryShowPart({ categories }: { categories: Category[] }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", paddingY: "0.5rem" }}>
            <h3>カテゴリー:</h3>
            {categories?.length === 0 && <span>未設定</span>}
            <span>{categories?.map(category => (
                <span key={category.id}>{category.name}</span>
            ))}</span>
        </Box>
    );
}