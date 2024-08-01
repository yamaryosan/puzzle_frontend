import { Category } from "@prisma/client";

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

export { getCategories, createCategory };