import prisma from "@/lib/prismaclient";
import { NextResponse, NextRequest } from "next/server";
import { Approach, Puzzle, Category, Hint } from "@prisma/client";

/**
 * ユーザに紐づく全データ(パズル、カテゴリ、定石、ヒント)を取得
 * @returns Promise
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(req.url);
        const user_id = searchParams.get("userId");

        if (!user_id) {
            throw new Error("ユーザIDが指定されていません");
        }

        const puzzles: Puzzle[] = await prisma.puzzle.findMany({
            where: { user_id },
            include: {
                PuzzleCategory: {
                    include: {
                        category: true,
                    },
                },
            },
        });

        const categories: Category[] = await prisma.category.findMany({
            where: { user_id },
        });

        const approaches: Approach[] = await prisma.approach.findMany({
            where: { user_id },
        });

        const hints: Hint[] = await prisma.hint.findMany({
            where: {
                puzzle: {
                    user_id,
                },
            },
        });

        return NextResponse.json({ puzzles, categories, approaches, hints });
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
