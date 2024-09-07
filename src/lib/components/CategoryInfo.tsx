import { Category, Puzzle } from "@prisma/client";
import Link from "next/link";
import { Button, Box } from "@mui/material";
import { Edit } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { updateCategory } from "@/lib/api/categoryapi";
import { fetchPuzzlesByCategoryId } from "@/lib/api/categoryapi";
import { Update } from "@mui/icons-material";
import useAuth from "@/lib/hooks/useAuth";

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
    // カテゴリー名が空の場合は更新しない
    if (categoryName === "") return;
    console.log("カテゴリー名の更新: ", categoryName, categoryId);
    try {
        await updateCategory(categoryId, categoryName);
    } catch (error) {
        console.error("カテゴリー名の更新に失敗: ", error);
    }
}

export default function CategoryInfo({ category, isActive }: CategoryInfoProps) {
    const { userId } = useAuth();
    const [categoryName, setCategoryName] = useState<string>(category.name);
    const [originalCategoryName, setOriginalCategoryName] = useState<string>(category.name);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [puzzles, setPuzzles] = useState<Puzzle[]>([]);

    // レンダリングのたびにisEditをfalseにする
    useEffect(() => {
        setIsEdit(false);
    }, [isActive]);

    // カテゴリーに紐づくパズル一覧を取得
    useEffect(() => {
        const fetchPuzzles = async () => {
            try {
                if (!userId) return;
                const data = await fetchPuzzlesByCategoryId(category.id.toString(), userId ?? '') as Puzzle[];
                setPuzzles(data);
            } catch (error) {
                console.error("カテゴリーに紐づくパズル一覧の取得に失敗: ", error);
            }
        }
        fetchPuzzles();
    }, [category.id, userId]);

    // 入力欄クリック時のイベント
    const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
        e.stopPropagation();
    }

    // 編集ボタンクリック時のイベント
    const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setIsEdit(true);
    }

    // カテゴリー名検証
    const validateCategoryName = (name: string) => {
        if (name === "") {
            alert("カテゴリー名は必須です");
            return false;
        }
        return true;
    }

    // カテゴリー名更新
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategoryName(e.target.value);
    }

    // 編集結果確定ボタンクリック時のイベント
    const handleUpdateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        // カテゴリー名が空の場合は元のカテゴリー名に戻す
        if (!validateCategoryName(categoryName)) {
            setCategoryName(originalCategoryName);
            return;
        }
        setIsEdit(false);
        updateCategoryName(category.id.toString(), categoryName);
        // 更新後のカテゴリー名を元のカテゴリー名に設定
        setOriginalCategoryName(categoryName);
    }

    return (
        <>
        {isActive ? (
            <>
            {isEdit ? (
                <>
                <input type="text" value={categoryName} onClick={handleInputClick} onChange={handleChange} />
                <Button onClick={handleUpdateClick}>
                    <Update />
                </Button>
                </>
                ) : (
                <>
                <h3 style={{display: "inline-block"}}>{categoryName}</h3>
                <Button onClick={handleEditClick}>
                    <Edit />
                </Button>
                </>
                )}
            </>
        ) : (
            <h3 style={{display: "inline-block"}}>{categoryName}</h3>
        )}
        <Box sx={{
            maxHeight: isActive ? '1000px' : '0px',
            overflow: 'hidden',
            transition: 'max-height 0.5s ease-in-out',
        }}>
            {/* カテゴリーに紐づくパズル一覧を表示 */}
            {puzzles.map((puzzle) => (
                <Link key={puzzle.id} href={`/puzzles/${puzzle.id}`}>
                    <Button
                    sx={{
                        display: 'block',
                        textAlign: 'left',
                        width: '100%',
                        color: 'black',
                        '&:hover': {
                            backgroundColor: "secondary.main",
                        },
                    }}
                    >
                        <h4>{puzzle.title}</h4>
                    </Button>
                </Link>
            ))}
        </Box>
        </>
    );
}