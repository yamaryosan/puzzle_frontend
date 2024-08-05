import { Hint } from "@prisma/client";

/**
 * パズルIDを指定してヒントを取得
 * @param id パズルID
 * @returns Promise<Hint[]>
 */
export default async function getHintsByPuzzleId(id: string): Promise<Hint[] | undefined> {
    try {
        const response = await fetch(`/api/puzzles/${id}/hints`);
        if (!response.ok) {
            const error = await response.json();
            console.error("ヒントの取得に失敗: ", error);
            return;
        }
        const hints = await response.json();
        console.log("ヒントの取得に成功: ", hints);
        return hints as Hint[];
    } catch (error) {
        console.error("ヒントの取得に失敗: ", error);
    }
}