import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaclient';
import { Approach } from '@prisma/client';

type approachRequest = {
    title: string;
    contentHtml: string;
    puzzle_id?: number;
};

/**
 * 定石一覧を取得する
 * @param req リクエスト
 * @returns レスポンス
 */
export async function GET(req: NextRequest) {
    try {
        const approaches = await prisma.approach.findMany();
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
        const { title, contentHtml, puzzle_id } = approachContent;
        if (!title || !contentHtml) {
            return NextResponse.json({ error: "Title and contentHtml are required" }, { status: 400 });
        }
        const approach: Approach = await prisma.approach.create({
            data: {
                title,
                content: contentHtml,
            },
        });
        // パズルIDが指定されている場合は、定石とパズルを紐づける
        if (puzzle_id) {
            await prisma.puzzleApproach.create({
                data: {
                    puzzle_id,
                    approach_id: approach.id,
                },
            });
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