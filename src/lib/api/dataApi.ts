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
        // データをjsonに変換
        const jsonData = JSON.stringify(data);
        // ファイル用のBlobを作成
        const blob = new Blob([jsonData], { type: "application/json" });
        // BlobのURLを作成
        const url = URL.createObjectURL(blob);
        // aタグのhrefとdownloadを設定
        const a = document.createElement("a");
        const fileName = `puzzle_data_${new Date().toISOString()}.json`;
        a.href = url;
        a.download = fileName;
        a.click();
        return data;
    } catch (error) {
        console.error("データの取得に失敗: ", error);
    }
}

/**
 * データ(パズル、カテゴリ、定石、ヒント)をインポートする
 * @param userId ユーザID
 * @param dataFile データファイル(json)
 * @returns Promise<Data>
 */
export async function importData(userId: string, dataFile: File) {
    if (!userId) {
        console.error("ユーザIDが取得できません");
        return;
    }
    try {
        console.log("今からデータをインポートします");
        // JSONファイルからデータを取得

        const data = await new Promise<Data>((resolve, reject) => {
            // ファイルを読み込む
            const reader = new FileReader();
            reader.onload = async () => {
                const data = JSON.parse(reader.result as string);
                resolve(data);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsText(dataFile);
            console.log("ファイルを読み込んでいます...");
        });

        console.log("データ: ", data);

        // APIにデータを送信

        const response = await fetch(`/api/data?userId=${userId}`, {
            method: "POST",
            body: JSON.stringify({ userId, data }),
        });
        if (!response.ok) {
            const error = await response.json();
            console.error("データのインポートに失敗: ", error);
            return;
        }
        console.log("データのインポートに成功: ", data);
        return data;
    } catch (error) {
        console.error("データのインポートに失敗: ", error);
    }
}
