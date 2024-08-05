import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaclient';
import { Approaches } from '@prisma/client';

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