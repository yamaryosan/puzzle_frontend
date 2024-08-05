import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaclient";

/**
 * 各定石に紐づいている問題を取得
 * @param req リクエスト
 * @param params パラメータ
 * @returns レスポンス
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);
        // IDが数字でないか、0以下の場合はエラー
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        // 定石IDに紐づく問題のIDを取得
        const puzzle_id = (await prisma.approach.findUnique({
            where: {
                id: id,
            },
            select: {
                puzzle_id: true,
            },
        }))?.puzzle_id;
        // 問題IDが存在しない場合はnullを返す
        if (!puzzle_id) {
            return NextResponse.json([]);
        }
        // 上記の問題IDを使って問題を取得
        const puzzles = await prisma.puzzle.findMany({
            where: {
                id: puzzle_id
            },
        });
        return NextResponse.json(puzzles);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Unknown error" }, { status: 500 });
        }
    }
}