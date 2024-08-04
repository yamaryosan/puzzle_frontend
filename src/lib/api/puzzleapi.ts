import { Puzzle } from "@prisma/client";
type Puzzles = Puzzle[];

type PuzzleWithCategories = {
    id: number;
    title: string;
    description: string;
    solution: string;
    user_answer: string;
    difficulty: number;
    is_favorite: boolean;
    created_at: Date;
    updated_at: Date;
    PuzzleCategory: {
        category: {
            id: number;
            name: string;
        }
    }[]
}

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
    const puzzles = await response.json() as PuzzleWithCategories[];
    console.log("パズルの取得に成功: ", puzzles);
    return puzzles;
}

/**
 * IDからパズルを取得
 * @param id パズルID
 * @returns Promise<PuzzleWithCategories>
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
    const puzzle = await response.json() as PuzzleWithCategories;
    console.log("パズルの取得に成功: ", puzzle);
    return puzzle;
}

/**
 * パズルを削除
 */
async function deletePuzzle(id: string) {
    const response = await fetch(`/api/puzzles/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        const error = await response.json();
        console.error("パズルの削除に失敗: ", error);
    }
    console.log("パズルの削除に成功");
}

export {getPuzzles, getPuzzleById, deletePuzzle};