import prisma from "@/lib/prismaclient";
import { NextResponse, NextRequest } from "next/server";
import { Puzzle } from "@prisma/client";
import { parse } from "path";

type puzzleRequest = {
    title: string;
    categoryIds: number[];
    approachIds: number[];
    descriptionHtml: string;
    solutionHtml: string;
    difficulty: number;
}

type PuzzleWithCategories = {
    id: number;
    title: string;
    description: string;
    solution: string;
    user_answer: string;
    difficulty: number;
    is_favorite: boolean;
    created_at: Date;
    updated_at: Date;
    PuzzleCategory: {
        category: {
            id: number;
            name: string;
        }
    }[]
}

/**
 * 特定IDのパズルを取得
 * @param req リクエスト
 * @param params パラメータ
 */
export async function GET(req: NextRequest, { params }: {params: {id: string} }): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);

        // IDが数字でない場合はエラー
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // パズルとそのカテゴリーを取得
        const puzzleWithCategories = await prisma.puzzle.findUnique({
            where: { id: id },
            include: {
                PuzzleCategory: {
                    include: {
                        category: true,
                    }
                }
            }
        }) as PuzzleWithCategories | null;

        // パズルが存在しない場合はエラー
        if (!puzzleWithCategories) {
            return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
        }
        return NextResponse.json(puzzleWithCategories);
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
        const { title, categoryIds, approachIds, descriptionHtml, solutionHtml, difficulty } = puzzleContent;

        // パズルを更新
        const puzzle: Puzzle = await prisma.puzzle.update({
            where: { id: id },
            data: {
                title: title,
                description: descriptionHtml,
                solution: solutionHtml,
                difficulty: difficulty,
            },
        });

        // カテゴリーを更新 (カテゴリー・パズル中間テーブルのデータを一旦削除してから再登録)
        await prisma.puzzleCategory.deleteMany({
            where: { puzzle_id: id },
        });
        for (const categoryId of categoryIds) {
            await prisma.puzzleCategory.create({
                data: {
                    puzzle_id: id,
                    category_id: categoryId,
                },
            });
        }

        // 定石を更新 (定石・パズル中間テーブルのデータを一旦削除してから再登録)
        await prisma.puzzleApproach.deleteMany({
            where: { puzzle_id: id },
        });
        for (const approachId of approachIds) {
            await prisma.puzzleApproach.create({
                data: {
                    puzzle_id: id,
                    approach_id: approachId,
                },
            });
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
 * パズルを削除
 */
export async function DELETE(req: NextRequest, { params }: {params: {id: string} }): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);

        // IDが数字でない、または0以下の場合はエラー
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // パズル・カテゴリー中間テーブルのデータを削除
        await prisma.puzzleCategory.deleteMany({
            where: { puzzle_id: id },
        });

        // パズル・定石中間テーブルのデータを削除
        await prisma.puzzleApproach.deleteMany({
            where: { puzzle_id: id },
        });

        // パズルを削除
        await prisma.puzzle.delete({
            where: { id: id },
        });

        return NextResponse.json({ message: "パズル削除成功" });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Unknown error" }, { status: 500 });
        }
    }
}