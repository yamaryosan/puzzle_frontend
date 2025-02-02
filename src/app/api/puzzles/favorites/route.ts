import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaclient";

/**
 * お気に入りのパズルを取得する
 * @param req リクエスト
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("userId");
    if (!user_id) {
        throw new Error("ユーザIDが指定されていません");
    }
    try {
        // お気に入りのパズルを取得
        const puzzles = await prisma.puzzles.findMany({
            where: { user_id, is_favorite: true },
        });

        return NextResponse.json(puzzles);
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
