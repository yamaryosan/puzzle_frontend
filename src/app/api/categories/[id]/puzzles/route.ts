import { puzzles } from "@prisma/client";
import prisma from "@/lib/prismaclient";
import { NextRequest, NextResponse } from "next/server";

/**
 * カテゴリーに紐づくパズル一覧を取得
 * @param params パラメータ
 * @returns Promise<NextResponse>
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);
        // IDが数字でない、または0以下の場合はエラー
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        // カテゴリーに紐づくパズルを取得
        const puzzles = await prisma.puzzles.findMany({
            where: {
                puzzle_categories: {
                    some: {
                        category_id: id,
                    },
                },
            },
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
