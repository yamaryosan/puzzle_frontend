import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaclient';
import { Approaches } from '@prisma/client';

type approachRequest = {
    title: string;
    contentHtml: string;
};

/**
 * 定石一覧を取得する
 * @param req リクエスト
 * @returns レスポンス
 */
export async function GET(req: NextRequest) {
    try {
        const approaches = await prisma.approaches.findMany();
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
 * 定石を追加する
 * @param req リクエスト
 * @returns レスポンス
 */
export async function POST(req: NextRequest) {
    try {
        const approachContent: approachRequest = await req.json();
        const { title, contentHtml } = approachContent;
        if (!title || !contentHtml) {
            return NextResponse.json({ error: "Title and contentHtml are required" }, { status: 400 });
        }
        const approach: Approaches = await prisma.approaches.create({
            data: {
                title,
                content: contentHtml,
                puzzle_id: 1,
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