import { NextRequest, NextResponse } from "next/server";
import s3 from "@/lib/s3";

/**
 * 画像のアップロード
 */
export async function POST(req: NextRequest) {
    try {
        // ファイルを取得
        const formData = await req.formData();
        const file = formData.get("image") as File | null;
        if (!file) {
            return new Response("No image found", { status: 400 });
        }
        // 画像ファイル名を生成 タイムスタンプ+ランダム文字列
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
        console.log(`Uploading image: ${filename}`);
        // ファイルをバッファに変換
        const buffer = await file.arrayBuffer();
        // S3にアップロード
        const params = {
            Bucket: process.env.AWS_BUCKET!,
            Key: filename,
            Body: Buffer.from(buffer),
            ContentType: file.type,
        };
        const result = await s3.upload(params).promise();
        if (!result.Location) {
            throw new Error("Failed to upload image");
        }
        const url = result.Location;
        console.log("Uploaded:", result.Location);
        // 画像のURLをテキストで返す
        return new NextResponse(url, {
            status: 200,
            headers: {
                "Content-Type": "text/plain",
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message, stack: error.stack },
                { status: 500 }
            );
        } else {
            return NextResponse.json(
                { error: "Unknown error" },
                { status: 500 }
            );
        }
    }
}
