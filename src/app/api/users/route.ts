import prisma from "../../../lib/prismaclient";
import { NextResponse } from "next/server";

type FirebaseUser = {
    firebaseUid: string;
    email: string | null;
    displayName: string | null;
};

/**
 * ユーザを作成
 */
export async function POST(req: Request) {
    try {
        const firebaseUser: FirebaseUser = await req.json();

        if (!firebaseUser.email) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        const user = await prisma.user.create({
            data: {
                firebaseUid: firebaseUser.firebaseUid,
                email: firebaseUser.email,
                name: firebaseUser.displayName,
            },
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Unknown error" }, { status: 500 });
        }
    }
}