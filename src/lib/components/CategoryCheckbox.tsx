import { useEffect, useState } from "react";
import { getCategories, createCategory, getCategoriesByPuzzleId } from "@/lib/api/categoryapi";
import { Category } from "@prisma/client";
import { Box, Button } from "@mui/material";
import { CreateNewFolderOutlined } from "@mui/icons-material";

/**
 * カテゴリー一覧を取得
 * @params void
 * @returns Promise<Categories>
 */
async function fetch() {
    const categories = await getCategories();
    return categories as Category[];
}

/**
 * 新規カテゴリー作成
 * @param name カテゴリー名
 * @returns Promise<Category>
 */
async function create(name: string) {
    // カテゴリー名が空の場合は作成しない
    if (name === "") {
        return
    }
    const newCategory = await createCategory(name);
    return newCategory as Category;
}

type CategoryWithRelation = {
    id: number;
    puzzle_id: number;
    category_id: number;
    category: Category;
};

interface CategoryCheckboxProps {
    onChange: (categoryIds: number[]) => void;
    puzzle_id: string;
    value: number[];
}

export default function CategoryCheckbox({ onChange, puzzle_id, value }: CategoryCheckboxProps) {
    const [categories, setCategories] = useState<Category[] | null>(null);
    const [newCategory, setNewCategory] = useState<string>("");
    const [checkedCategoryIds, setCheckedCategoryIds] = useState<number[]>(value);

    // カテゴリー一覧を取得
    async function fetchCategories() {
        try {
            const categories = await fetch();
            setCategories(categories);
            return categories;
        } catch (error) {
            console.error("定石の取得に失敗: ", error);
            return null;
        }
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    // 選択中のカテゴリー一覧を取得
    useEffect(() => {
        async function fetchInitialCategories(id: string): Promise<CategoryWithRelation[] | undefined> {
            return getCategoriesByPuzzleId(id);
        }
        fetchInitialCategories(puzzle_id).then((categories) => {
            if (!categories) {
                return;
            }
            const initialCategoryIds = categories.map((c) => c.category_id);
            console.log("カテゴリーを取得しました: ", initialCategoryIds);
            setCheckedCategoryIds(initialCategoryIds);
        });
    }, []);

    // チェックされたカテゴリーのIDを親コンポーネントに渡す
    useEffect(() => {
        onChange(checkedCategoryIds);
    }, [checkedCategoryIds, onChange]);

    // 新規カテゴリー作成
    const handleNewCategory = async () => {
        try {
            const createdCategory = await create(newCategory);
            if (!createdCategory) {
                console.error("カテゴリー名が空のため作成できません");
                return;
            }
            // 入力値をリセット
            setNewCategory("");
            // カテゴリー一覧を再取得
            const categories = await fetch();
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
        <Box
        sx={{
            padding: "1rem",
            border: "1px solid #ccc",
            borderRadius: "0.25rem",
            fontSize: "1.5rem",
        }}
        >
            {categories?.length === 0 && <p>カテゴリーがありません</p>}
            <Box
            sx={{
                display: "grid",
                gap: "1rem",
                gridTemplateColumns: "2fr 2fr",
            }}
            >
            {categories?.map((category) => (
                <div key={category.id}>
                    <input
                        type="checkbox"
                        id={category.id.toString()}
                        checked={checkedCategoryIds.includes(category.id)}
                        onChange={() => handleCheckboxChange(category.id)}
                    />
                    <label htmlFor={category.id.toString()} className="cursor-pointer">{category.name}</label>
                </div>
            ))}
            </Box>

            <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                paddingTop: "1rem",
                gap: "1rem",
            }}
            >
            <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md"
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
            onClick={handleNewCategory}>
                <CreateNewFolderOutlined />
            </Button>
            </Box>

        </Box>
        </>
    );
}