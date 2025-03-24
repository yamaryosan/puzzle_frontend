import Box from "@mui/material/Box";
import { categories } from "@prisma/client";

export default function CategoryShowPart({
    categories,
}: {
    categories: categories[];
}) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", paddingY: "0.5rem" }}>
            <h4>カテゴリー:</h4>
            {categories?.length === 0 && <span>未設定</span>}
            {categories?.map((category) => (
                <span key={category.id} style={{ fontSize: "1.0rem" }}>
                    {category.name + ","}
                </span>
            ))}
        </Box>
    );
}
