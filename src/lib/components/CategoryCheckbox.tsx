'use client';

import { useCallback, useEffect, useState, useContext} from "react";
import { getCategories, createCategory, getCategoriesByPuzzleId } from "@/lib/api/categoryapi";
import { Category } from "@prisma/client";
import { Box, Button, Input } from "@mui/material";
import { CreateNewFolderOutlined } from "@mui/icons-material";
import Checkbox from "@mui/material/Checkbox";
import DeviceTypeContext from "@/lib/context/DeviceTypeContext";

/**
 * 新規カテゴリー作成
 * @param name カテゴリー名
 * @param userId ユーザID
 * @returns Promise<Category>
 */
async function create(name: string, userId: string) {
    // カテゴリー名が空の場合は作成しない
    if (name === "") {
        return;
    }
    const newCategory = await createCategory(name, userId);
    return newCategory as Category;
}

type CategoryCheckboxProps = {
    userId: string;
    onChange: (categoryIds: number[]) => void;
    puzzle_id: string;
    value: number[];
}

export default function CategoryCheckbox({ userId, onChange, puzzle_id, value }: CategoryCheckboxProps) {
    const [categories, setCategories] = useState<Category[] | null>(null);
    const [newCategory, setNewCategory] = useState<string>("");
    const [checkedCategoryIds, setCheckedCategoryIds] = useState<number[]>(value);

    const deviceType = useContext(DeviceTypeContext);

    // カテゴリー一覧を取得
    const fetchCategories = useCallback(async () => {
        try {
            const categories = await getCategories(userId);
            setCategories(categories);
            return categories;
        } catch (error) {
            console.error("定石の取得に失敗: ", error);
            return null;
        }
    }, [userId]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // 選択中のカテゴリー一覧を取得
    useEffect(() => {
        async function fetchInitialCategories(id: string): Promise<Category[] | undefined> {
            return getCategoriesByPuzzleId(id, userId);
        }
        fetchInitialCategories(puzzle_id).then((categories) => {
            if (!categories) {
                return;
            }
            const initialCategoryIds = categories.map(category => category.id);
            console.log("カテゴリーを取得しました: ", initialCategoryIds);
            setCheckedCategoryIds(initialCategoryIds);
        });
    }, [puzzle_id, userId]);

    // チェックされたカテゴリーのIDを親コンポーネントに渡す
    useEffect(() => {
        onChange(checkedCategoryIds);
    }, [checkedCategoryIds, onChange]);

    // 新規カテゴリー作成
    const handleNewCategory = async () => {
        try {
            const createdCategory = await create(newCategory, userId);
            if (!createdCategory) {
                console.error("カテゴリー名が空のため作成できません");
                return;
            }
            // 入力値をリセット
            setNewCategory("");
            // カテゴリー一覧を再取得
            const categories = await fetchCategories();
            setCategories(categories);
            // 新しいカテゴリーにチェックを入れる
            setCheckedCategoryIds(prev => [...prev, createdCategory.id]);
        } catch (error) {
            console.error("カテゴリーの作成に失敗: ", error);
        }
    }

    // チェックボックスの状態を変更(チェックされている場合は削除、チェックされていない場合は追加)
    const handleCheckboxChange = (categoryId: number) => {
        setCheckedCategoryIds(prev => 
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    }

    return (
        <>
        <Box sx={{ paddingY: '0.5rem' }}>
            <h3>カテゴリー</h3>
            <Box sx={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "0.25rem", fontSize: `${deviceType === "mobile" ? "1.5rem" : "2rem"}` }}>
                {categories?.length === 0 && <p>カテゴリーを作成しましょう</p>}
                <Box sx={{ display: "grid", gap: "1rem", gridTemplateColumns: `${deviceType === "mobile" ? "1fr" : "1fr 1fr"}` }}>
                {categories?.map((category) => (
                    <div key={category.id}>
                        <Checkbox
                            checked={checkedCategoryIds.includes(category.id)}
                            id={category.id.toString()}
                            onChange={() => handleCheckboxChange(category.id)}
                            size={deviceType === "mobile" ? "large" : "medium"}
                            sx={{
                                color: "primary.main",
                                "&.Mui-checked": {
                                    color: "primary.main",
                                }
                            }}
                        />
                        <label htmlFor={category.id.toString()} className="cursor-pointer">{category.name}</label>
                    </div>
                ))}
                </Box>

                {deviceType === "desktop" && (
                    <Box sx={{ display: "flex", flexDirection: "row", paddingTop: "1rem", gap: "1rem" }}>
                    <Input
                        type="text"
                        role="textbox"
                        placeholder="新規カテゴリー"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        sx={{ padding: "0.5rem", fontSize: "1rem", width: "100%" }}
                    />
                    <Button
                    sx={{
                        color: "black",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.25rem",
                        cursor: "pointer",
                        ":hover": {
                            backgroundColor: "secondary.light",
                            transition: "background-color 0.3s",
                        }
                    }}
                    aria-label="create"
                    onClick={handleNewCategory}>
                        <CreateNewFolderOutlined />
                    </Button>
                    </Box>
                )}
                {deviceType === "mobile" && (
                    <>
                    <Input
                        type="text"
                        role="textbox"
                        placeholder="新規カテゴリー"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        sx={{ padding: "0.5rem", fontSize: "1rem", width: "100%", marginTop: "2rem" }}
                    />
                    <Button
                    sx={{
                        color: "white",
                        fontSize: "1.2rem",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.25rem",
                        width: "100%",
                        marginTop: "1rem",
                        bgcolor: "primary.main",
                        cursor: "pointer",
                        ":hover": {
                            backgroundColor: "secondary.light",
                            transition: "background-color 0.3s",
                        }
                    }}
                    aria-label="create"
                    onClick={handleNewCategory}>
                        <span>作成</span>
                    </Button>
                    </>
                )}
            </Box>
        </Box>
        </>
    );
}