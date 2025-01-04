import { Approach, Puzzle, Category, Hint } from "@prisma/client";

type Data = {
    puzzles: Puzzle[];
    categories: Category[];
    approaches: Approach[];
    hints: Hint[];
};

/**
 * データ(パズル、カテゴリ、定石、ヒント)を取得する
 * @param userId ユーザID
 * @returns Promise<Data>
 */
export async function exportData(userId: string) {
    try {
        if (!userId) {
            console.error("ユーザIDが取得できません");
            return;
        }

        console.log("ユーザID: ", userId);

        const response = await fetch(`/api/data?userId=${userId}`);
        if (!response.ok) {
            const error = await response.json();
            console.error("データの取得に失敗: ", error);
            return;
        }

        const data = (await response.json()) as Data[];
        console.log("データの取得に成功: ", data);
        return data as Data[];
    } catch (error) {
        console.error("データの取得に失敗: ", error);
    }
}
