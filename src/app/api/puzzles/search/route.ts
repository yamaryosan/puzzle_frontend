import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaclient";

/**
 * 検索ワードに一致するパズルを取得する
 * @param req リクエスト
 */
export async function POST(req: NextRequest) {
    const { search, userId } = await req.json();
    if (!search) {
        return NextResponse.json({ error: "検索ワードが指定されていません" }, { status: 400 });
    }
    if (!userId) {
        return NextResponse.json({ error: "ユーザIDが指定されていません" }, { status: 400 });
    }

    const puzzles = await prisma.puzzle.findMany({
        where: {
            user_id: userId,
            OR: [
                { title: { contains: search } },
                { description: { contains: search } },
            ],
        },
    });
    return NextResponse.json(puzzles);
}