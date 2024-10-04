import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaclient";

/**
 * パズルIDに紐づく定石を取得
 * @param req リクエスト
 * @param params パラメータ
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
        const id = parseInt(params.id);

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "ユーザIDが指定されていません" }, { status: 400 });
        }

        // IDが数字でない場合はエラー
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        // パズルに紐づく定石を取得
        const puzzleApproaches = await prisma.puzzleApproach.findMany({
            where: { puzzle_id: id },
            include: {
                approach: true,
            },
        });
        // 定石のみを取得
        const approaches = puzzleApproaches.map((puzzleApproach) => puzzleApproach.approach);
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
 * パズルに定石を追加
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
        
        // 定石IDを取得
        const { approachIds } = await req.json();

        // パズルが存在しない場合はエラー
        const puzzle = await prisma.puzzle.findUnique({
            where: { id },
        });
        if (!puzzle) {
            return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
        }

        // 定石・パズル中間テーブルに追加
        for (const approachId of approachIds) {
            await prisma.puzzleApproach.create({
                data: {
                    puzzle_id: id,
                    approach_id: approachId,
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
 * パズルの定石を更新
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
        
        // 定石IDを取得
        const { approachIds } = await req.json();

        // パズルが存在しない場合はエラー
        const puzzle = await prisma.puzzle.findUnique({
            where: { id },
        });
        if (!puzzle) {
            return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
        }

        // 定石・パズル中間テーブルを更新
        await prisma.puzzleApproach.deleteMany({
            where: { puzzle_id: id },
        });
        for (const approachId of approachIds) {
            await prisma.puzzleApproach.create({
                data: {
                    puzzle_id: id,
                    approach_id: approachId,
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