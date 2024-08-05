import { Approach } from "@prisma/client";

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