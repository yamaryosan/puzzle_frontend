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

/**
 * パズルを更新
 */
export async function PUT(req: NextRequest, { params }: {params: {id: string} }): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);

        // IDが数字でない、または0以下の場合はエラー
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        
        const puzzleContent: puzzleRequest = await req.json();
        const { title, descriptionHtml, solutionHtml } = puzzleContent;

        // パズルを更新
        const puzzle: Puzzle = await prisma.puzzle.update({
            where: { id: id },
            data: {
                title: title,
                description: descriptionHtml,
                solution: solutionHtml,
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