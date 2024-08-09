import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaclient";

/**
 * 解けたかどうかを記録
 * @param req リクエスト
 * @param params パラメータ
 */
export async function PUT(req: NextRequest, { params }: {params: {id: string}}) {
    try {
        const id = parseInt(params.id);

        // IDが数字でない、または0以下の場合はエラー
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const {isSolved} = await req.json();

        // 解けたかどうかを更新(正解の場合、回答を削除)
        const puzzle = await prisma.puzzle.update({
            where: { id: id },
            data: {
                user_answer: isSolved ? "" : undefined,
                is_solved: isSolved
            },
        });

        return NextResponse.json(puzzle);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Unknown error" }, { status: 500 });
        }
    }
}