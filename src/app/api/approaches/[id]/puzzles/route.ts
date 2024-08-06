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
        const puzzle_id = await prisma.puzzleApproach.findMany({
            where: {
                approach_id: id
            },
            select: {
                puzzle_id: true
            }
        });
        // 問題IDから問題を取得
        const puzzles = await prisma.puzzle.findMany({
            where: {
                id: {
                    in: puzzle_id.map((p) => p.puzzle_id)
                }
            }
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