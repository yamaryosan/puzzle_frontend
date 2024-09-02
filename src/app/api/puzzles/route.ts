import prisma from "@/lib/prismaclient";
import { NextResponse, NextRequest } from "next/server";
import { Puzzle, Category } from "@prisma/client";

type puzzleRequest = {
    title: string;
    descriptionHtml: string;
    solutionHtml: string;
    difficulty: number;
    uId: string;
}

/**
 * パズル一覧を取得
 * @returns Promise<Puzzle[]>
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(req.url);
        const uId = searchParams.get("userId");

        if (!uId) {
            throw new Error("ユーザIDが指定されていません");
        }

        const puzzles = await prisma.puzzle.findMany({
            where: {
                user_id: uId
            },
            include: {
                PuzzleCategory: {
                    include: {
                        category: true
                    }
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

/**
 * パズルを作成
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const puzzleContent: puzzleRequest = await req.json();
        const { title, descriptionHtml, solutionHtml, difficulty, uId } = puzzleContent;

        // パズルを作成
        const puzzle: Puzzle = await prisma.puzzle.create({
            data: {
                title: title,
                description: descriptionHtml,
                user_answer: "",
                solution: solutionHtml,
                difficulty: difficulty,
                user_id: uId,
            },
        });

        return NextResponse.json(puzzle, { status: 201 });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Unknown error" }, { status: 500 });
        }
    }
}