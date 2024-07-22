import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { createDir } from './createDir';

/**
 * 画像のアップロード
 */
export async function POST(req: NextRequest) {
    try {
        // ファイルを取得
        const formData = await req.formData();
        const file = formData.get('image') as File | null;
        if (!file) {
            return new Response('No image found', { status: 400 });
        }
        // 画像ファイル名を生成
        const filename = `${Date.now()}-${file.name}`;
        console.log(`Uploading image: ${filename}`);
        // ファイルパスを生成
        const filePath = path.join(process.cwd(), 'public', 'images', filename);
        console.log(`Saving image to: ${filePath}`);
        // ファイルをバッファに変換
        const buffer = await file.arrayBuffer();
        // 画像ディレクトリを作成
        await createDir(path.dirname(filePath));
        // ファイルを保存
        await writeFile(filePath, Buffer.from(buffer));
        console.log(`Image saved: ${filename}`);
        // URLパスを生成
        const url = `/images/${filename}`;
        // 画像のURLをテキストで返す
        return new NextResponse(url, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Unknown error" }, { status: 500 });
        }
    }
}