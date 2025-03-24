import { approaches, puzzles } from "@prisma/client";

/**
 * 定石一覧を取得する
 * @param userId ユーザID
 * @returns Promise<Approach[]>
 */
export async function getApproaches(userId: string) {
    try {
        if (!userId) {
            console.error("ユーザIDが取得できません");
            return;
        }

        console.log("ユーザID: ", userId);

        const response = await fetch(`/api/approaches?userId=${userId}`);
        if (!response.ok) {
            const error = await response.json();
            console.error("定石の取得に失敗: ", error);
            return;
        }

        const approaches = (await response.json()) as approaches[];
        console.log("定石の取得に成功: ", approaches);
        return approaches as approaches[];
    } catch (error) {
        console.error("定石の取得に失敗: ", error);
    }
}

/**
 * 各定石を取得する
 * @param id 定石ID
 * @param userId ユーザID
 * @returns Promise<Approach>
 */
export async function getApproach(id: string, userId: string) {
    try {
        if (!userId) {
            console.error("ユーザIDが取得できません");
            return;
        }
        const response = await fetch(`/api/approaches/${id}?userId=${userId}`);
        if (!response.ok) {
            const error = await response.json();
            console.error("定石の取得に失敗: ", error);
            return;
        }
        const approach = await response.json();
        console.log("定石の取得に成功: ", approach);
        return approach as approaches;
    } catch (error) {
        console.error("定石の取得に失敗: ", error);
    }
}

/**
 * 定石に紐づいている問題を取得する
 * @param id 定石ID
 * @param userId ユーザID
 * @returns Promise<Puzzle[]>
 */
export async function getPuzzlesByApproachId(id: string, userId: string) {
    try {
        if (!userId) {
            console.error("ユーザIDが取得できません");
            return;
        }
        const response = await fetch(
            `/api/approaches/${id}/puzzles?userId=${userId}`
        );
        if (!response.ok) {
            const error = await response.json();
            console.error("問題の取得に失敗: ", error);
            return;
        }
        const puzzles = await response.json();
        console.log("問題の取得に成功: ", puzzles);
        return puzzles as puzzles[];
    } catch (error) {
        console.error("問題の取得に失敗: ", error);
    }
}

/**
 * 問題に紐づいている定石を取得する
 * @param id 問題ID
 * @param userId ユーザID
 * @returns Promise<Approach[]>
 */
export async function getApproachesByPuzzleId(id: string, userId: string) {
    try {
        const response = await fetch(
            `/api/puzzles/${id}/approaches?userId=${userId}`
        );
        if (!response.ok) {
            const error = await response.json();
            console.error("定石の取得に失敗: ", error);
            return;
        }
        const approaches = await response.json();
        console.log("定石の取得に成功: ", approaches);
        return approaches as approaches[];
    } catch (error) {
        console.error("定石の取得に失敗: ", error);
    }
}

/**
 * 定石を削除する
 * @param id 定石ID
 */
export async function deleteApproach(id: string) {
    try {
        const response = await fetch(`/api/approaches/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            const error = await response.json();
            console.error("定石の削除に失敗: ", error);
        }
        console.log("定石を削除しました");
    } catch (error) {
        console.error("定石の削除に失敗: ", error);
    }
}
