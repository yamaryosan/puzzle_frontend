import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaclient";

/**
 * ランダムにパズルを取得する
 * @param req リクエスト
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("userId");
    if (!user_id) {
        throw new Error("ユーザIDが指定されていません");
    }
    const count = searchParams.get("count");
    if (!count) {
        throw new Error("取得するパズルの数が指定されていません");
    }
    try {
        // パズルをランダムに取得
        const puzzles = await prisma.puzzles.findMany({
            where: { user_id },
            orderBy: { id: "desc" },
            take: parseInt(count),
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
