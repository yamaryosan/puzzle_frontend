import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaclient";

/**
 * ヒントを取得
 * @param req リクエスト
 * @param params パラメータ
 */
export async function GET(req: NextRequest, {params}: {params: {id: string}}) {
    try {
        const id = parseInt(params.id);

        // IDが数字でない、または0以下の場合はエラー
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        // パズルが存在しない場合はエラー
        const puzzle = await prisma.puzzle.findUnique({
            where: { id },
        });
        if (!puzzle) {
            return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
        }
        // ヒントを取得
        const hints = await prisma.hint.findMany({
            where: { puzzle_id: id },
        });
        return NextResponse.json(hints);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Unknown error" }, { status: 500 });
        }
    }
}

/**
 * ヒントを追加
 * @param req リクエスト
 * @param params パラメータ
 */
export async function POST(req: NextRequest, {params}: {params: {id: string}}) {
    try {
        const id = parseInt(params.id);

        // IDが数字でない、または0以下の場合はエラー
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        // パズルが存在しない場合はエラー
        const puzzle = await prisma.puzzle.findUnique({
            where: { id },
        });
        if (!puzzle) {
            return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
        }

        // ヒントを追加
        const { hintHtml } = await req.json();
        await prisma.hint.create({
            data: {
                puzzle_id: id,
                content: hintHtml,
            },
        });
        return NextResponse.json({ message: "Success" });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Unknown error" }, { status: 500 });
        }
    }
}