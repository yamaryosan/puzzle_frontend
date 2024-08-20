import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaclient";

/**
 * お気に入り登録/解除を更新する
 * @param req リクエスト
 * @param params パラメータ
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);

        // IDが数字でない、または0以下の場合はエラー
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // パズルが存在しない場合はエラー
        const puzzle = await prisma.puzzle.findUnique({
            where: { id },
        });
        if (!puzzle) {
            return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
        }

        // お気に入り登録/解除を切り替え
        const favorite = !puzzle.is_favorite;
        await prisma.puzzle.update({
            where: { id },
            data: {
                is_favorite: favorite,
            },
        });

        return NextResponse.json({ favorite });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Unknown error" }, { status: 500 });
        }
    }
}