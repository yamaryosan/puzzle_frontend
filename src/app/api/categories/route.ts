import prisma from "@/lib/prismaclient";
import { NextResponse, NextRequest } from "next/server";
import { categories } from "@prisma/client";

/**
 * カテゴリー一覧を取得
 * @returns Promise<Category[]>
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(req.url);
        const user_id = searchParams.get("userId");

        if (!user_id) {
            throw new Error("ユーザIDが指定されていません");
        }
        const categories: categories[] = await prisma.categories.findMany({
            where: { user_id },
        });
        return NextResponse.json(categories);
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
 * 新規カテゴリー作成
 * @return Promise<Category>
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const { name, userId } = await req.json();

        // カテゴリー名が空の場合は作成しない
        if (name === "") {
            return NextResponse.json(
                { error: "Name is empty" },
                { status: 400 }
            );
        }
        // カテゴリー名が重複している場合は作成しない
        const existingCategory = await prisma.categories.findFirst({
            where: { name, user_id: userId },
        });
        if (existingCategory) {
            return NextResponse.json(
                { error: "Name is already exists" },
                { status: 400 }
            );
        }

        const category: categories = await prisma.categories.create({
            data: { name, user_id: userId },
        });

        return NextResponse.json(category, { status: 201 });
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
