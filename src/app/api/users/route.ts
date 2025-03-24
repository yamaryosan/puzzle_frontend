import prisma from "@/lib/prismaclient";
import { NextResponse, NextRequest } from "next/server";

type FirebaseUser = {
    firebaseUid: string;
    email: string | null;
    displayName: string | null;
};

/**
 * ユーザを作成
 */
export async function POST(req: NextRequest) {
    try {
        const firebaseUser: FirebaseUser = await req.json();

        if (!firebaseUser.firebaseUid || !firebaseUser.email) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        const user = await prisma.users.create({
            data: {
                firebase_uid: firebaseUser.firebaseUid,
                email: firebaseUser.email,
                name: firebaseUser.displayName,
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
