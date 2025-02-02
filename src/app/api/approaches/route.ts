import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaclient";
import { approaches } from "@prisma/client";

type approachRequest = {
    title: string;
    userId: string;
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
        const { searchParams } = new URL(req.url);

        const user_id = searchParams.get("userId");
        if (!user_id) {
            throw new Error("ユーザIDが指定されていません");
        }

        const approaches = await prisma.approaches.findMany({
            where: { user_id },
        });
        return NextResponse.json(approaches);
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
 * 定石を追加する
 * @param req リクエスト
 * @returns レスポンス
 */
export async function POST(req: NextRequest) {
    try {
        const approachContent: approachRequest = await req.json();
        const { title, userId, contentHtml, puzzle_id } = approachContent;
        if (!title || !contentHtml) {
            return NextResponse.json(
                { error: "Title and contentHtml are required" },
                { status: 400 }
            );
        }
        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }
        const approach: approaches = await prisma.approaches.create({
            data: {
                title,
                user_id: userId,
                content: contentHtml,
            },
        });
        // パズルIDが指定されている場合は、定石とパズルを紐づける
        if (puzzle_id) {
            await prisma.puzzle_approaches.create({
                data: {
                    puzzle_id,
                    approach_id: approach.id,
                },
            });
        }
        return NextResponse.json(approach);
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
