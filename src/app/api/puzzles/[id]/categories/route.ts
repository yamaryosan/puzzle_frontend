import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaclient';

/**
 * パズルIDに紐づくカテゴリーを取得
 * @param req リクエスト
 * @param params パラメータ
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);

        // IDが数字でない場合はエラー
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // パズルに紐づくカテゴリーを取得
        const approaches = await prisma.puzzleCategory.findMany({
            where: { puzzle_id: id },
            include: {
                category: true,
            }
        });
        return NextResponse.json(approaches);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Unknown error" }, { status: 500 });
        }
    }
}

/**
 * パズルにカテゴリーを追加
 * @param req リクエスト
 * @param params パラメータ
 * @returns レスポンス
 */
export async function POST(req: NextRequest, { params }: {params: {id: string} }): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);

        // IDが数字でない、または0以下の場合はエラー
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        
        // カテゴリーIDを取得
        const { categoryIds } = await req.json();

        // パズルが存在しない場合はエラー
        const puzzle = await prisma.puzzle.findUnique({
            where: { id },
        });
        if (!puzzle) {
            return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
        }

        // カテゴリー・パズル中間テーブルに追加
        for (const categoryId of categoryIds) {
            await prisma.puzzleCategory.create({
                data: {
                    puzzle_id: id,
                    category_id: categoryId,
                },
            });
        }
        return NextResponse.json({ message: "Success" });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Unknown error" }, { status: 500 });
        }
    }
};

/**
 * パズルのカテゴリーを更新
 * @param req リクエスト
 * @param params パラメータ
 * @returns レスポンス
 */
export async function PUT(req: NextRequest, { params }: {params: {id: string} }): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);

        // IDが数字でない、または0以下の場合はエラー
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        
        // カテゴリーIDを取得
        const { categoryIds } = await req.json();

        // パズルが存在しない場合はエラー
        const puzzle = await prisma.puzzle.findUnique({
            where: { id },
        });
        if (!puzzle) {
            return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
        }

        // カテゴリー・パズル中間テーブルを更新
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
        
        return NextResponse.json({ message: "Success" });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Unknown error" }, { status: 500 });
        }
    }
};
