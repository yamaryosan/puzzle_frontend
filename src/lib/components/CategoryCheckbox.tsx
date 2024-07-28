import { useEffect, useState } from "react";
import { getCategories, createCategory } from "@/lib/api/categoryapi";
import { Category } from "@prisma/client";

type Categories = Category[];

/**
 * カテゴリー一覧を取得
 * @params void
 * @returns Promise<Categories>
 */
async function fetch() {
    const categories = await getCategories();
    return categories as Categories;
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

export default function CategoryCheckbox() {
    const [categories, setCategories] = useState<Categories | null>(null);
    const [newCategory, setNewCategory] = useState<string>("");
    const [checkedCategories, setCheckedCategories] = useState<number[]>([]);
    
    // カテゴリー一覧を取得
    async function fetchCategories() {
        try {
            const categories = await fetch();
            setCategories(categories);
            return categories;
        } catch (error) {
            console.error("カテゴリーの取得に失敗: ", error);
            return null;
        }
    }

    useEffect(() => {
        fetchCategories();
    }, []);

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
            await fetchCategories();
            // 新しいカテゴリーにチェックを入れる
            setCheckedCategories(prev => [...prev, createdCategory.id]);
        } catch (error) {
            console.error("カテゴリーの作成に失敗: ", error);
        }
    }

    // チェックボックスの状態を変更(チェックされている場合は削除、チェックされていない場合は追加)
    const handleCheckboxChange = (categoryId: number) => {
        setCheckedCategories(prev => 
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    }

    return (
        <div>
            <h1>カテゴリー</h1>
            {categories?.length === 0 && <p>カテゴリーがありません</p>}
            {categories?.map((category) => (
                <div key={category.id}>
                    <input
                        type="checkbox"
                        id={category.id.toString()}
                        checked={checkedCategories.includes(category.id)}
                        onChange={() => handleCheckboxChange(category.id)}
                    />
                    <label htmlFor={category.id.toString()}>{category.name}</label>
                </div>
            ))}
            <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
            />
            <button onClick={handleNewCategory}>追加</button>
        </div>
    );
}