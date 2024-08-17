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
    const [categoryName, setCategoryName] = useState<string>(category.name);

    // 入力欄クリック時のイベント
    const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
        e.stopPropagation(); // カードのクリックイベントが発生しないようにする
    }

    // 編集ボタンクリック時のイベント
    const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation(); // カードのクリックイベントが発生しないようにする
        // カテゴリー名更新処理をここで実装
    }

    return (
        <>
        {isActive ? (
            <>
            <input type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} onClick={handleInputClick} />
            <Button onClick={handleEditClick}>
                <Edit />
            </Button>
            </>
        ) : (
            <h3 style={{display: "inline-block"}}>{category.name}</h3>
        )}
        <Box sx={{
            maxHeight: isActive ? '1000px' : '0px',
            overflow: 'hidden',
            transition: 'max-height 0.5s ease-in-out',
        }}>
            {/* カテゴリーに紐づくパズル一覧を表示 */}
        </Box>
        </>
    );
}