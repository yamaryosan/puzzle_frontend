import prisma from "@/lib/prismaclient";
import { NextResponse, NextRequest } from "next/server";
import { Puzzle } from "@prisma/client";
import { parse } from "path";

type puzzleRequest = {
    title: string;
    descriptionHtml: string;
    solutionHtml: string;
}

/**
 * 特定IDのパズルを取得
 * @returns Promise<Puzzle>
 */
export async function GET(req: NextRequest, { params }: {params: {id: string} }): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);

        // IDが数字でない場合はエラー
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // パズルを取得
        const puzzle: Puzzle | null = await prisma.puzzle.findUnique({
            where: { id: id },
        });

        if (!puzzle) {
            return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
        }

        return NextResponse.json(puzzle);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Unknown error" }, { status: 500 });
        }
    }
}