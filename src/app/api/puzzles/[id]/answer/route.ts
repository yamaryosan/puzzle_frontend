import { NextRequest, NextResponse } from "next/server";
import { Puzzle } from "@prisma/client";
import prisma from "@/lib/prismaclient";

/**
 * 回答を送信
 * @param req リクエスト
 * @param params パラメータ
 */
export async function PUT(req: NextRequest, { params }: {params: {id: string} }): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);

        // IDが数字でない、または0以下の場合はエラー
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        const { answer } = await req.json();

        // パズルを更新
        const puzzle = await prisma.puzzle.update({
            where: { id: id },
            data: {
                user_answer: answer,
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