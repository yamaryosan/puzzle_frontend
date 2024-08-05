import { Approaches } from "@prisma/client";

/**
 * 定石一覧を取得する
 * @returns Promise<Approaches[]>
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
        return approaches as Approaches[];
    } catch (error) {
        console.error("定石の取得に失敗: ", error);
    }
}