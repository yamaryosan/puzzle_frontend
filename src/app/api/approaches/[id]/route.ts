import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaclient";

/**
 * 各定石の情報を取得
 * @param req リクエスト
 * @param params パラメータ
 * @returns レスポンス
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        const approach = await prisma.approach.findUnique({
            where: {
                id: id,
            },
        });
        if (!approach) {
            return NextResponse.json({ error: "Approach not found" }, { status: 404 });
        }
        return NextResponse.json(approach);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Unknown error" }, { status: 500 });
        }
    }
}