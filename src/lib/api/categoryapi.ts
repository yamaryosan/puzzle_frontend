import { categories, puzzles } from "@prisma/client";

/**
 * カテゴリー一覧を取得
 * @param userId ユーザーID
 * @returns Promise<Category[]>
 */
export async function getCategories(userId: string) {
    const response = await fetch(`/api/categories?userId=${userId}`);
    if (!response.ok) {
        const error = await response.json();
        console.error("カテゴリーの取得に失敗: ", error);
    }
    const categories = (await response.json()) as categories[];
    console.log("カテゴリーの取得に成功: ", categories);
    return categories;
}

/**
 * 新規カテゴリー作成
 * @param name カテゴリー名
 * @param userId ユーザID
 * @returns Promise<Category>
 */
export async function createCategory(name: string, userId: string) {
    const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, userId }),
    });
    if (!response.ok) {
        const error = await response.json();
        console.error("カテゴリーの作成に失敗: ", error);
        return;
    }
    console.log(`カテゴリー「${name}」の作成に成功`);
    return response.json() as Promise<categories>;
}

/**
 * カテゴリーIDを指定してカテゴリーを取得
 * @param id カテゴリーID
 * @param userId ユーザID
 * @returns Promise<Category>
 */
export async function getCategoryById(id: string, userId: string) {
    if (!id) {
        console.error("カテゴリーIDが指定されていません");
        return;
    }
    if (!userId) {
        console.error("ユーザIDが取得できません");
        return;
    }
    const response = await fetch(`/api/categories/${id}?userId=${userId}`);
    if (!response.ok) {
        const error = await response.json();
        console.error("カテゴリーの取得に失敗: ", error);
    }
    const category = await response.json();
    console.log("カテゴリーの取得に成功: ", category);
    return category as categories;
}

/**
 * カテゴリーに紐づくパズル一覧を取得
 * @param id カテゴリーID
 * @param userId ユーザID
 * @returns
 */
export async function fetchPuzzlesByCategoryId(id: string, userId: string) {
    try {
        if (!id) {
            console.error("カテゴリーIDが指定されていません");
            return;
        }
        if (!userId) {
            console.error("ユーザIDが取得できません");
            return;
        }
        const response = await fetch(
            `/api/categories/${id}/puzzles?userId=${userId}`
        );
        if (!response.ok) {
            const error = await response.json();
            console.error("パズルの取得に失敗: ", error);
        }
        const puzzles = await response.json();
        return puzzles as puzzles[];
    } catch (error) {
        console.error("パズルの取得に失敗: ", error);
    }
}

/**
 * カテゴリー情報を更新
 * @param id カテゴリーID
 * @param name カテゴリー名
 */
export async function updateCategory(
    id: string,
    name: string
): Promise<categories> {
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
    return response.json() as Promise<categories>;
}

/**
 * カテゴリーを削除
 */
export async function deleteCategory(id: string) {
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
 * @param userId ユーザID
 * @returns Promise<Category[]>
 */
export async function getCategoriesByPuzzleId(id: string, userId: string) {
    try {
        if (!id) {
            console.error("問題IDが指定されていません");
            return;
        }
        if (!userId) {
            console.error("ユーザIDが取得できません");
            return;
        }
        const response = await fetch(`/api/puzzles/${id}/categories`);
        if (!response.ok) {
            const error = await response.json();
            console.error("カテゴリーの取得に失敗: ", error);
            return;
        }
        const categories = await response.json();
        console.log("カテゴリーの取得に成功: ", categories);
        return categories as categories[];
    } catch (error) {
        console.error("カテゴリーの取得に失敗: ", error);
    }
}
