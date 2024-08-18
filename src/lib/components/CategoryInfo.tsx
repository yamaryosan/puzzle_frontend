import { Category, Puzzle } from "@prisma/client";
import Link from "next/link";
import { Button, Box } from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { updateCategory } from "@/lib/api/categoryapi";
import { fetchPuzzlesByCategoryId } from "@/lib/api/categoryapi";
import { Update } from "@mui/icons-material";

type CategoryInfoProps = {
    category: Category;
    isActive: boolean;
};

/**
 * カテゴリー名を更新
 * @param categoryId カテゴリーID
 * @param categoryName カテゴリー名
 */
async function updateCategoryName(categoryId: string, categoryName: string) {
    console.log("カテゴリー名の更新: ", categoryName, categoryId);
    try {
        await updateCategory(categoryId, categoryName);
    } catch (error) {
        console.error("カテゴリー名の更新に失敗: ", error);
    }
}

export default function CategoryInfo({ category, isActive }: CategoryInfoProps) {
    const [categoryName, setCategoryName] = useState<string>(category.name);
    const [isEdit, setIsEdit] = useState<boolean>(false);

    // レンダリングのたびにisEditをfalseにする
    useEffect(() => {
        setIsEdit(false);
    }, [isActive]);

    // 入力欄クリック時のイベント
    const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
        e.stopPropagation();
    }

    // 編集ボタンクリック時のイベント
    const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setIsEdit(true);
    }

    // 編集結果確定ボタンクリック時のイベント
    const handleUpdateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setIsEdit(false);
        updateCategoryName(category.id.toString(), categoryName);
    }

    return (
        <>
        {isActive ? (
            <>
            {isEdit ? (
                <>
                <input type="text" value={categoryName} onClick={handleInputClick} onChange={(e) => setCategoryName(e.target.value)} />
                <Button onClick={handleUpdateClick}>
                    <Update />
                </Button>
                </>
                ) : (
                <>
                <h3 style={{display: "inline-block"}}>{category.name}</h3>
                <Button onClick={handleEditClick}>
                    <Edit />
                </Button>
                </>
                )}
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