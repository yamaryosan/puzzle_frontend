import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaclient';
import { Category } from '@prisma/client';

/**
 * カテゴリー情報を取得
 * @params req リクエスト
 * @params params パラメータ
 * @returns Promise<NextResponse> レスポンス
 */
export async function GET(req: NextRequest, {params}: {params: {id: string}}): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({error: 'Invalid ID'}, {status: 400});
        }
        const category = await prisma.category.findUnique({
            where: {
                id: id
            }
        });
        if (!category) {
            return NextResponse.json({error: 'Category not found'}, {status: 404});
        }
        return NextResponse.json(category);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({error: error.message, stack: error.stack}, {status: 500});
        } else {
            return NextResponse.json({error: 'Unknown error'}, {status: 500});
        }
    }
}

/**
 * カテゴリー情報を更新
 * @params req リクエスト
 * @params params パラメータ
 * @returns Promise<NextResponse> レスポンス
 */
export async function PUT(req: NextRequest, {params}: {params: {id: string}}): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({error: 'Invalid ID'}, {status: 400});
        }
        const {name} = await req.json();
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json({error: 'Invalid name'}, {status: 400});
        }
        const category = await prisma.category.update({
            where: {
                id: id
            },
            data: {
                name: name
            }
        });
        return NextResponse.json(category);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({error: error.message, stack: error.stack}, {status: 500});
        } else {
            return NextResponse.json({error: 'Unknown error'}, {status: 500});
        }
    }
}

/**
 * 未分類カテゴリーを取得
 */
export async function getUncategorizedCategory(): Promise<Category> {
    const uncategorizedName = '未分類';
    let uncategorizedCategory = await prisma.category.findFirst({
        where: {
            name: uncategorizedName
        }
    });
    // 未分類カテゴリーが存在しない場合は作成
    if (!uncategorizedCategory) {
        uncategorizedCategory = await prisma.category.create({
            data: {
                name: uncategorizedName
            }
        });
    }
    return uncategorizedCategory;
}

/**
 * カテゴリー情報を削除
 * @params req リクエスト
 * @params params パラメータ
 */
export async function DELETE(req: NextRequest, {params}: {params: {id: string}}): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({error: 'Invalid ID'}, {status: 400});
        }
        // 外部キー制約を考慮して、関連するパズルカテゴリー情報を先に削除
        await prisma.puzzleCategory.deleteMany({
            where: {
                category_id: id
            }
        });
        // カテゴリー情報を削除
        await prisma.category.delete({
            where: {
                id: id
            }
        });
        // どのカテゴリーにも紐づかないパズル情報を取得
        const puzzles = await prisma.puzzle.findMany({
            where: {
                PuzzleCategory: {
                    none: {}
                }
            }
        });
        // 紐づかないパズルを未分類カテゴリーに追加
        const uncategorizedCategory = await getUncategorizedCategory();
        await prisma.puzzleCategory.createMany({
            data: puzzles.map((puzzle) => {
                return {
                    puzzle_id: puzzle.id,
                    category_id: uncategorizedCategory.id
                }
            })
        });
        return NextResponse.json({message: 'Category deleted'});
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({error: error.message, stack: error.stack}, {status: 500});
        } else {
            return NextResponse.json({error: 'Unknown error'}, {status: 500});
        }
    }
}