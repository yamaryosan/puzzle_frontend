import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismaclient";

/**
 * 検索ワードに一致するパズルを取得する
 */
export async function POST(request: NextRequest) {
    const { search } = await request.json();
    const puzzles = await prisma.puzzle.findMany({
        where: {
            OR: [
                { title: { contains: search } },
                { description: { contains: search } },
            ],
        },
    });
    return NextResponse.json(puzzles);
}