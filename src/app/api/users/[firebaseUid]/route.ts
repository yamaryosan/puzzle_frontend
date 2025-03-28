import prisma from "@/lib/prismaclient";
import { NextRequest, NextResponse } from "next/server";

type FirebaseUser = {
    firebaseUid: string;
    email: string | null;
    displayName: string | null;
};

/**
 * ユーザを作成
 * @param req リクエスト
 * @param params パラメータ
 */
export async function POST(
    req: NextRequest,
    { params }: { params: { firebaseUid: string } }
) {
    try {
        // リクエストボディが空でないかを確認
        if (!req.body) {
            return NextResponse.json(
                { error: "Request body is empty" },
                { status: 400 }
            );
        }

        const firebaseUid = params.firebaseUid;
        const firebaseUser: FirebaseUser = await req.json();

        // ユーザが存在しない場合は作成、存在する場合は更新
        const user = await prisma.users.upsert({
            where: { firebase_uid: firebaseUser.firebaseUid },
            update: {
                email: firebaseUser.email ?? "",
                name: firebaseUser.displayName ?? "",
            },
            create: {
                firebase_uid: firebaseUser.firebaseUid,
                email: firebaseUser.email ?? "",
                name: firebaseUser.displayName ?? "",
            },
        });

        return NextResponse.json(user, { status: 201 });
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
 * ユーザを更新
 * @param req リクエスト
 * @param params パラメータ
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: { firebaseUid: string } }
) {
    try {
        const firebaseUid = params.firebaseUid;
        const firebaseUser: FirebaseUser = await req.json();

        if (!firebaseUser.firebaseUid || !firebaseUser.email) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        const user = await prisma.users.update({
            where: { firebase_uid: firebaseUser.firebaseUid },
            data: {
                email: firebaseUser.email,
                name: firebaseUser.displayName,
            },
        });

        return NextResponse.json(user, { status: 200 });
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
 * ユーザを削除
 * @param req リクエスト
 * @param params パラメータ
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: { firebaseUid: string } }
) {
    try {
        const firebaseUid = params.firebaseUid;

        // ユーザに紐づくパズルIDを取得
        const puzzleIds = await prisma.puzzles.findMany({
            where: { user_id: firebaseUid },
            select: { id: true },
        });
        // ユーザに紐づくパズル・カテゴリー中間テーブルを削除
        await prisma.puzzle_categories.deleteMany({
            where: { puzzle_id: { in: puzzleIds.map((p) => p.id) } },
        });
        // ユーザに紐づくカテゴリーを削除
        await prisma.categories.deleteMany({
            where: { user_id: firebaseUid },
        });
        // ユーザに紐づくパズル・定石中間テーブルを削除
        await prisma.puzzle_approaches.deleteMany({
            where: { puzzle_id: { in: puzzleIds.map((p) => p.id) } },
        });
        // ユーザに紐づく定石を削除
        await prisma.approaches.deleteMany({
            where: { user_id: firebaseUid },
        });
        // ユーザに紐づくヒントを削除
        await prisma.hints.deleteMany({
            where: { puzzle_id: { in: puzzleIds.map((p) => p.id) } },
        });
        // ユーザに紐づくパズルを削除
        await prisma.puzzles.deleteMany({
            where: { user_id: firebaseUid },
        });
        // ユーザを削除
        const user = await prisma.users.delete({
            where: { firebase_uid: firebaseUid },
        });

        return NextResponse.json(user, { status: 200 });
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
