import { Puzzle } from "@prisma/client";

/**
 * パズル一覧を取得
 * @returns Promise<Puzzles>
 */
export async function getPuzzles() {
    const response = await fetch("/api/puzzles");
    if (!response.ok) {
        const error = await response.json();
        console.error("パズルの取得に失敗: ", error);
    }
    const puzzles = await response.json() as Puzzle[];
    console.log("パズルの取得に成功: ", puzzles);
    return puzzles;
}

/**
 * IDからパズルを取得
 * @param id パズルID
 * @returns Promise<Puzzle>
 */
export async function getPuzzleById(id: string) {
    const response = await fetch(`/api/puzzles/${id}`);
    if (!response.ok) {
        const error = await response.json();
        console.error("パズルの取得に失敗: ", error);
    }
    if (response.status === 404) {
        console.error("パズルが見つかりません");
        return null;
    }
    const puzzle = await response.json() as Puzzle;
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
 */
export async function toggleFavoritePuzzle(id: string) {
    const response = await fetch(`/api/puzzles/${id}/favorites`, {
        method: "PUT",
    });
    if (!response.ok) {
        const error = await response.json();
        console.error("お気に入りの登録/解除に失敗: ", error);
    }
    console.log("お気に入りの登録/解除に成功");
}

/**
 * お気に入りのパズル一覧を取得
 * @returns Promise<Puzzles>
 */
export async function getFavoritePuzzles() {
    const response = await fetch("/api/puzzles/favorites");
    if (!response.ok) {
        const error = await response.json();
        console.error("お気に入りのパズルの取得に失敗: ", error);
    }
    const puzzles = await response.json() as Puzzle[];
    console.log("お気に入りのパズルの取得に成功: ", puzzles);
    return puzzles;
}