import prisma from "@/lib/prismaclient";
import { NextResponse, NextRequest } from "next/server";
import { Puzzle } from "@prisma/client";

type puzzleRequest = {
    contentHtml: string;
}

/**
 * パズルを作成
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const puzzleContent: puzzleRequest = await req.json();
        const contentHtml = puzzleContent.contentHtml;

        if (!contentHtml) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        // パズルを作成
        const puzzle: Puzzle = await prisma.puzzle.create({
            data: {
                title: "Untitled",
                description: contentHtml,
                user_answer: "",
                solution: "",
                user_id: "",
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