import fs from "fs/promises";

/**
 * 画像ディレクトリを作成する
 */
export const createDir = async (dirPath: string) => {
    // ディレクトリが存在しない場合は作成
    try {
        await fs.access(dirPath);
    } catch (error) {
        await fs.mkdir(dirPath, { recursive: true, mode: 0o755 });
    }
};
