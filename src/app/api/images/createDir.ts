import fs from 'fs/promises';

/**
 * 画像ディレクトリを作成する
 */
export const createDir = async (dirPath: string) => {
    try {
        await fs.mkdir(dirPath);
    } catch (error) {
        console.log(error);
    }
}