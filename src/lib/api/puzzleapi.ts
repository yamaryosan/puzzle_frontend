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
