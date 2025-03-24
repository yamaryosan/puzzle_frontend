import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaclient";
import { categories } from "@prisma/client";

/**
 * カテゴリー情報を取得
 * @params req リクエスト
 * @params params パラメータ
 * @returns Promise<NextResponse> レスポンス
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        const category = await prisma.categories.findUnique({
            where: {
                id: id,
            },
        });
        if (!category) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 404 }
            );
        }
        return NextResponse.json(category);
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
 * カテゴリー情報を更新
 * @params req リクエスト
 * @params params パラメータ
 * @returns Promise<NextResponse> レスポンス
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        const { name } = await req.json();
        if (!name || typeof name !== "string" || name.trim() === "") {
            return NextResponse.json(
                { error: "Invalid name" },
                { status: 400 }
            );
        }
        const category = await prisma.categories.update({
            where: {
                id: id,
            },
            data: {
                name: name,
            },
        });
        return NextResponse.json(category);
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
 * 未分類カテゴリーを取得
 * @params user_id ユーザID
 */
async function getUncategorizedCategory(user_id: string): Promise<categories> {
    const uncategorizedName = "未分類";
    let uncategorizedCategory = await prisma.categories.findFirst({
        where: {
            name: uncategorizedName,
        },
    });
    // 未分類カテゴリーが存在しない場合は作成
    if (!uncategorizedCategory) {
        uncategorizedCategory = await prisma.categories.create({
            data: {
                name: uncategorizedName,
                user_id: user_id,
            },
        });
    }
    return uncategorizedCategory;
}

/**
 * カテゴリー情報を削除
 * @params req リクエスト
 * @params params パラメータ
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("userId");

    if (!user_id) {
        throw new Error("ユーザIDが指定されていません");
    }
    try {
        const id = parseInt(params.id);
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        // 外部キー制約を考慮して、関連するパズルカテゴリー情報を先に削除
        await prisma.puzzle_categories.deleteMany({
            where: {
                category_id: id,
            },
        });
        // カテゴリー情報を削除
        await prisma.categories.delete({
            where: {
                id: id,
            },
        });
        // どのカテゴリーにも紐づかないパズル情報を取得
        const puzzles = await prisma.puzzles.findMany({
            where: {
                puzzle_categories: {
                    none: {},
                },
            },
        });
        // 紐づかないパズルを未分類カテゴリーに追加
        const uncategorizedCategory = await getUncategorizedCategory(user_id);
        await prisma.puzzle_categories.createMany({
            data: puzzles.map((puzzle) => {
                return {
                    puzzle_id: puzzle.id,
                    category_id: uncategorizedCategory.id,
                };
            }),
        });
        return NextResponse.json({ message: "Category deleted" });
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
