import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaclient";

/**
 * パズルIDに紐づく定石を取得
 * @param req リクエスト
 * @param params パラメータ
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);

        // IDが数字でない場合はエラー
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // パズルに紐づく定石を取得
        const approaches = await prisma.puzzleApproach.findMany({
            where: { puzzle_id: id },
            include: {
                approach: true,
            }
        });
        return NextResponse.json(approaches);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Unknown error" }, { status: 500 });
        }
    }
}