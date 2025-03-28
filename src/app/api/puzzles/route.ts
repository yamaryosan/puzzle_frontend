import prisma from "@/lib/prismaclient";
import { NextResponse, NextRequest } from "next/server";
import { puzzles } from "@prisma/client";

type puzzleRequest = {
    title: string;
    descriptionHtml: string;
    solutionHtml: string;
    difficulty: number;
    userId: string;
    source: string;
};

/**
 * パズル一覧を取得
 * @returns Promise<Puzzle[]>
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(req.url);
        const user_id = searchParams.get("userId");

        if (!user_id) {
            throw new Error("ユーザIDが指定されていません");
        }

        const puzzles: puzzles[] = await prisma.puzzles.findMany({
            where: { user_id },
            include: {
                puzzle_categories: {
                    include: {
                        category: true,
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

/**
 * パズルを作成
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const puzzleContent: puzzleRequest = await req.json();
        const {
            title,
            descriptionHtml,
            solutionHtml,
            difficulty,
            userId,
            source,
        } = puzzleContent;

        // パズルを作成
        const puzzle: puzzles = await prisma.puzzles.create({
            data: {
                title: title,
                description: descriptionHtml,
                user_answer: "",
                solution: solutionHtml,
                difficulty: difficulty,
                user_id: userId,
                source: source,
            },
        });

        return NextResponse.json(puzzle, { status: 201 });
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
