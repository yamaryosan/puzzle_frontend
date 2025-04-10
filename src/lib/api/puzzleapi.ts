import { puzzles } from "@prisma/client";

/**
 * パズル一覧を取得
 * @params userId ユーザID
 * @returns Promise<Puzzles>
 */
export async function getPuzzles(userId: string) {
    const response = await fetch(`/api/puzzles?userId=${userId}`);
    if (!response.ok) {
        const error = await response.json();
        console.error("パズルの取得に失敗: ", error);
    }
    const puzzles = (await response.json()) as puzzles[];
    console.log("パズルの取得に成功: ", puzzles);
    return puzzles;
}

/**
 * ランダムなパズル一覧を取得
 * @param userId ユーザID
 * @param count 取得するパズルの数
 * @returns Promise<Puzzles>
 */
export async function getRandomPuzzles(userId: string, count: string) {
    const response = await fetch(
        `/api/puzzles/random?userId=${userId}&count=${count}`
    );
    if (!response.ok) {
        const error = await response.json();
        console.error("ランダムなパズルの取得に失敗: ", error);
    }
    const puzzles = (await response.json()) as puzzles[];
    console.log("ランダムなパズルの取得に成功: ", puzzles);
    return puzzles;
}

/**
 * IDからパズルを取得
 * @param id パズルID
 * @param userId ユーザID
 * @returns Promise<Puzzle>
 */
export async function getPuzzleById(id: string, userId: string) {
    if (!id) {
        console.error("パズルIDが指定されていません");
        return;
    }
    if (!userId) {
        console.error("ユーザIDが取得できません");
        return;
    }
    const response = await fetch(`/api/puzzles/${id}?userId=${userId}`);
    if (!response.ok) {
        const error = await response.json();
        console.error("パズルの取得に失敗: ", error);
    }
    if (response.status === 404) {
        console.error("パズルが見つかりません");
        return null;
    }
    const puzzle = (await response.json()) as puzzles;
    console.log("パズルの取得に成功: ", puzzle);
    return puzzle;
}

/**
 * パズルを削除
 * @param id パズルID
 */
export async function deletePuzzle(id: string) {
    const response = await fetch(`/api/puzzles/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        const error = await response.json();
        console.error("パズルの削除に失敗: ", error);
    }
    console.log("パズルの削除に成功");
}

/**
 * パズルのお気に入り登録/解除の切り替え
 * @param id パズルID
 * @param userId ユーザID
 */
export async function toggleFavoritePuzzle(id: string, userId: string) {
    const response = await fetch(`/api/puzzles/${id}/favorites`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
        const error = await response.json();
        console.error("お気に入りの登録/解除に失敗: ", error);
    }
    console.log("お気に入りの登録/解除に成功");
}

/**
 * お気に入りのパズル一覧を取得
 * @param userId ユーザID
 * @returns Promise<Puzzles>
 */
export async function getFavoritePuzzles(userId: string) {
    if (!userId) {
        console.error("ユーザIDが取得できません");
        return;
    }
    const response = await fetch(`/api/puzzles/favorites?userId=${userId}`);
    if (!response.ok) {
        const error = await response.json();
        console.error("お気に入りのパズルの取得に失敗: ", error);
    }
    const puzzles = (await response.json()) as puzzles[];
    console.log("お気に入りのパズルの取得に成功: ", puzzles);
    return puzzles;
}

/**
 * 検索ワードからパズルを検索
 * @param keyword 検索ワード
 * @param userId ユーザID
 * @returns Promise<Puzzles>
 */
export async function searchPuzzles(keyword: string, userId: string) {
    if (!keyword) {
        console.error("検索ワードが指定されていません");
        return;
    }
    if (!userId) {
        return;
    }
    const response = await fetch("/api/puzzles/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ search: keyword, userId }),
    });
    if (!response.ok) {
        const error = await response.json();
        console.error("パズルの検索に失敗: ", error);
    }
    const puzzles = (await response.json()) as puzzles[];
    console.log("パズルの検索に成功: ", puzzles);
    return puzzles;
}

/**
 * ユーザ登録時にデフォルトのパズルを作成
 * @param userId ユーザID
 * @returns Promise<void>
 */
export async function createDefaultPuzzles(userId: string) {
    if (!userId) {
        console.error("ユーザIDが指定されていません");
        return;
    }
    const response = await fetch("/api/puzzles/default", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
        const error = await response.json();
        console.error("デフォルトのパズルの作成に失敗: ", error);
    }
    console.log("デフォルトのパズルの作成に成功");
}
