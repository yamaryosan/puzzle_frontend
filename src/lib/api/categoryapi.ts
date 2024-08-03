import { Category, Puzzle } from "@prisma/client";

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

export { getCategories, createCategory, fetchPuzzlesByCategoryId };