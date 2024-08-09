import { Approach, Puzzle } from "@prisma/client";

type ApproachWithRelation = {
    id: number;
    puzzle_id: number;
    approach_id: number;
    approach: Approach;
};

/**
 * 定石一覧を取得する
 * @returns Promise<Approach[]>
 */
export async function getApproaches() {
    try {
        const response = await fetch('/api/approaches');
        if (!response.ok) {
            const error = await response.json();
            console.error("定石の取得に失敗: ", error);
            return;
        }
        const approaches = await response.json();
        console.log("定石の取得に成功: ", approaches);
        return approaches as Approach[];
    } catch (error) {
        console.error("定石の取得に失敗: ", error);
    }
}

/**
 * 各定石を取得する
 * @param id 定石ID
 * @returns Promise<Approach>
 */
export async function getApproach(id: number) {
    try {
        const response = await fetch(`/api/approaches/${id}`);
        if (!response.ok) {
            const error = await response.json();
            console.error("定石の取得に失敗: ", error);
            return;
        }
        const approach = await response.json();
        console.log("定石の取得に成功: ", approach);
        return approach as Approach;
    } catch (error) {
        console.error("定石の取得に失敗: ", error);
    }
}

/**
 * 定石に紐づいている問題を取得する
 * @param id 定石ID
 * @returns Promise<Puzzle[]>
 */
export async function getPuzzlesByApproachId(id: number) {
    try {
        const response = await fetch(`/api/approaches/${id}/puzzles`);
        if (!response.ok) {
            const error = await response.json();
            console.error("問題の取得に失敗: ", error);
            return;
        }
        const puzzles = await response.json();
        console.log("問題の取得に成功: ", puzzles);
        return puzzles as Puzzle[];
    } catch (error) {
        console.error("問題の取得に失敗: ", error);
    }
}

/**
 * 問題に紐づいている定石を取得する
 * @param id 問題ID
 * @returns Promise<ApproachWithRelation[]>
 */
export async function getApproachesByPuzzleId(id: string) {
    try {
        const response = await fetch(`/api/puzzles/${id}/approaches`);
        if (!response.ok) {
            const error = await response.json();
            console.error("定石の取得に失敗: ", error);
            return;
        }
        const approaches = await response.json();
        console.log("定石の取得に成功: ", approaches);
        return approaches as ApproachWithRelation[];
    } catch (error) {
        console.error("定石の取得に失敗: ", error);
    }
}