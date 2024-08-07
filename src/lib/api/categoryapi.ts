import { Category, Puzzle } from "@prisma/client";

type CategoryWithRelation = {
    id: number;
    puzzle_id: number;
    category_id: number;
    category: Category;
};

/**
 * カテゴリー一覧を取得
 * @returns Promise<Category[]>
 */
async function getCategories() {
    const response = await fetch("/api/categories");
    if (!response.ok) {
        const error = await response.json();
        console.error("カテゴリーの取得に失敗: ", error);
    }
    const categories = await response.json();
    console.log("カテゴリーの取得に成功: ", categories);
    return categories as Category[];
}

/**
 * 新規カテゴリー作成
 * @param name カテゴリー名
 * @returns Promise<Category>
 */
async function createCategory(name: string) {
    const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) {
        const error = await response.json();
        console.error("カテゴリーの作成に失敗: ", error);
        return;
    }
    console.log(`カテゴリー「${name}」の作成に成功`);
    return response.json() as Promise<Category>;
}

/**
 * カテゴリーIDを指定してカテゴリーを取得
 * @param id カテゴリーID
 * @returns Promise<Category>
 */
async function getCategoryById(id: string): Promise<Category> {
    const response = await fetch(`/api/categories/${id}`);
    if (!response.ok) {
        const error = await response.json();
        console.error("カテゴリーの取得に失敗: ", error);
    }
    const category = await response.json();
    console.log("カテゴリーの取得に成功: ", category);
    return category as Category;
}

/**
 * カテゴリーに紐づくパズル一覧を取得
 * @param id カテゴリーID
 * @returns
 */
async function fetchPuzzlesByCategoryId(id: string) {
    try {
        if (!id) {
            console.error("カテゴリーIDが指定されていません");
            return;
        }
        const response = await fetch(`/api/categories/${id}/puzzles`);
        if (!response.ok) {
            const error = await response.json();
            console.error("パズルの取得に失敗: ", error);
        }
        const puzzles = await response.json();
        return puzzles as Puzzle[];
    } catch (error) {
        console.error("パズルの取得に失敗: ", error);
    }
}

/**
 * カテゴリー情報を更新
 * @param id カテゴリーID
 * @param name カテゴリー名
 */
async function updateCategory(id: string, name: string): Promise<Category> {
    const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) {
        const error = await response.json();
        console.error("カテゴリーの更新に失敗: ", error);
        return error;
    }
    console.log(`カテゴリー「${name}」の更新に成功`);
    return response.json() as Promise<Category>;
}

/**
 * カテゴリーを削除
 */
async function deleteCategory(id: string) {
    const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        const error = await response.json();
        console.error("カテゴリーの削除に失敗: ", error);
        return;
    }
    console.log("カテゴリーの削除に成功");
}

/**
 * 問題に紐づいているカテゴリーを取得する
 * @param id 問題ID
 * @returns Promise<CategoryWithRelation[]>
 */
export async function getCategoriesByPuzzleId(id: number) {
    try {
        const response = await fetch(`/api/puzzles/${id}/categories`);
        if (!response.ok) {
            const error = await response.json();
            console.error("カテゴリーの取得に失敗: ", error);
            return;
        }
        const categories = await response.json();
        console.log("カテゴリーの取得に成功: ", categories);
        return categories as CategoryWithRelation[];
    } catch (error) {
        console.error("カテゴリーの取得に失敗: ", error);
    }
}

export { getCategories, createCategory, getCategoryById, updateCategory, deleteCategory, fetchPuzzlesByCategoryId };