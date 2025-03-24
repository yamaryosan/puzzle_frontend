import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaclient";

/**
 * ヒントを取得
 * @param req リクエスト
 * @param params パラメータ
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        // IDが数字でない、または0以下の場合はエラー
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        // パズルが存在しない場合はエラー
        const puzzle = await prisma.puzzles.findUnique({
            where: { id },
        });
        if (!puzzle) {
            return NextResponse.json(
                { error: "Puzzle not found" },
                { status: 404 }
            );
        }
        // ヒントを取得
        const hints = await prisma.hints.findMany({
            where: { puzzle_id: id },
        });
        return NextResponse.json(hints);
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
 * ヒントを追加
 * @param req リクエスト
 * @param params パラメータ
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        // IDが数字でない、または0以下の場合はエラー
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        // パズルが存在しない場合はエラー
        const puzzle = await prisma.puzzles.findUnique({
            where: { id },
        });
        // ユーザIDが指定されていない場合はエラー
        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }
        // パズルが存在しない場合はエラー
        if (!puzzle) {
            return NextResponse.json(
                { error: "Puzzle not found" },
                { status: 404 }
            );
        }

        // ヒントを追加
        const { hintHtmls } = await req.json();
        for (const hintHtml of hintHtmls) {
            await prisma.hints.create({
                data: {
                    puzzle_id: id,
                    user_id: userId,
                    content: hintHtml,
                },
            });
        }

        return NextResponse.json({ message: "Success" });
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
 * ヒントを更新
 * @param req リクエスト
 * @param params パラメータ
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        // IDが数字でない、または0以下の場合はエラー
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        // ユーザIDが指定されていない場合はエラー
        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }
        // パズルが存在しない場合はエラー
        const puzzle = await prisma.puzzles.findUnique({
            where: { id },
        });
        if (!puzzle) {
            return NextResponse.json(
                { error: "Puzzle not found" },
                { status: 404 }
            );
        }

        // ヒントを更新
        const { hintHtmls } = await req.json();
        await prisma.hints.deleteMany({
            where: { puzzle_id: id, user_id: userId },
        });
        for (const hintHtml of hintHtmls) {
            await prisma.hints.create({
                data: {
                    puzzle_id: id,
                    user_id: userId,
                    content: hintHtml,
                },
            });
        }
        return NextResponse.json({ message: "Success" });
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
