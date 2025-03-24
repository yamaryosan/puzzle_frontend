import prisma from "@/lib/prismaclient";
import { NextResponse, NextRequest } from "next/server";
import { puzzles } from "@prisma/client";

type puzzleRequest = {
    title: string;
    source: string;
    categoryIds: number[];
    approachIds: number[];
    descriptionHtml: string;
    solutionHtml: string;
    difficulty: number;
};

type PuzzleWithCategories = {
    id: number;
    title: string;
    source: string;
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
        };
    }[];
};

/**
 * 特定IDのパズルを取得
 * @param req リクエスト
 * @param params パラメータ
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        // IDが数字でない場合はエラー
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        // ユーザIDが指定されていない場合はエラー
        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        // パズルとそのカテゴリーを取得
        const puzzleWithCategories = (await prisma.puzzles.findUnique({
            where: { id: id, user_id: userId },
            include: {
                puzzle_categories: {
                    include: {
                        category: true,
                    },
                },
            },
        })) as PuzzleWithCategories | null;

        // パズルが存在しない場合はエラー
        if (!puzzleWithCategories) {
            return NextResponse.json(
                { error: "Puzzle not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(puzzleWithCategories);
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
 * パズルを更新
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);

        // IDが数字でない、または0以下の場合はエラー
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const puzzleContent: puzzleRequest = await req.json();
        const {
            title,
            source,
            categoryIds,
            approachIds,
            descriptionHtml,
            solutionHtml,
            difficulty,
        } = puzzleContent;

        // パズルを更新
        const puzzle: puzzles = await prisma.puzzles.update({
            where: { id: id },
            data: {
                title: title,
                source: source,
                description: descriptionHtml,
                solution: solutionHtml,
                difficulty: difficulty,
            },
        });

        // カテゴリーを更新 (カテゴリー・パズル中間テーブルのデータを一旦削除してから再登録)
        await prisma.puzzle_categories.deleteMany({
            where: { puzzle_id: id },
        });
        for (const categoryId of categoryIds) {
            await prisma.puzzle_categories.create({
                data: {
                    puzzle_id: id,
                    category_id: categoryId,
                },
            });
        }

        // 定石を更新 (定石・パズル中間テーブルのデータを一旦削除してから再登録)
        await prisma.puzzle_approaches.deleteMany({
            where: { puzzle_id: id },
        });
        for (const approachId of approachIds) {
            await prisma.puzzle_approaches.create({
                data: {
                    puzzle_id: id,
                    approach_id: approachId,
                },
            });
        }

        return NextResponse.json(puzzle);
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
 * パズルを削除
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);

        // IDが数字でない、または0以下の場合はエラー
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // パズル・カテゴリー中間テーブルのデータを削除
        await prisma.puzzle_categories.deleteMany({
            where: { puzzle_id: id },
        });

        // パズル・定石中間テーブルのデータを削除
        await prisma.puzzle_approaches.deleteMany({
            where: { puzzle_id: id },
        });

        // ヒントテーブルのデータを削除
        await prisma.hints.deleteMany({
            where: { puzzle_id: id },
        });

        // パズルを削除
        await prisma.puzzles.delete({
            where: { id: id },
        });

        return NextResponse.json({ message: "パズル削除成功" });
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
