import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaclient";

type approachRequest = {
    title: string;
    contentHtml: string;
};

/**
 * 各定石の情報を取得
 * @param req リクエスト
 * @param params パラメータ
 * @returns レスポンス
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        const approach = await prisma.approach.findUnique({
            where: {
                id: id,
            },
        });
        if (!approach) {
            return NextResponse.json({ error: "Approach not found" }, { status: 404 });
        }
        return NextResponse.json(approach);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Unknown error" }, { status: 500 });
        }
    }
}

/**
 * 定石を更新
 * @param req リクエスト
 * @param params パラメータ
 * @returns レスポンス
 */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }
        const puzzleContent: approachRequest = await req.json();
        const { title, contentHtml } = puzzleContent;
        if (!title || !contentHtml) {
            return NextResponse.json({ error: "Title and contentHtml are required" }, { status: 400 });
        }
        // 定石を更新
        const approach = await prisma.approach.update({
            where: {
                id: id,
            },
            data: {
                title: title,
                content: contentHtml,
            },
        });
        return NextResponse.json(approach);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Unknown error" }, { status: 500 });
        }
    }
}