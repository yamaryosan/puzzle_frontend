import { Puzzle } from "@prisma/client";
type Puzzles = Puzzle[];

/**
 * パズル一覧を取得
 * @returns Promise<Puzzles>
 */
async function getPuzzles() {
    const response = await fetch("/api/puzzles");
    if (!response.ok) {
        const error = await response.json();
        console.error("パズルの取得に失敗: ", error);
    }
    const puzzles = await response.json();
    console.log("パズルの取得に成功: ", puzzles);
    return puzzles as Puzzles;
}

/**
 * IDからパズルを取得
 * @param id パズルID
 * @returns Promise<Puzzle> パズル
 */
async function getPuzzleById(id: string) {
    const response = await fetch(`/api/puzzles/${id}`);
    if (!response.ok) {
        const error = await response.json();
        console.error("パズルの取得に失敗: ", error);
    }
    if (response.status === 404) {
        console.error("パズルが見つかりません");
        return null;
    }
    const puzzle = await response.json();
    console.log("パズルの取得に成功: ", puzzle);
    return puzzle as Puzzle;
}

export {getPuzzles, getPuzzleById};