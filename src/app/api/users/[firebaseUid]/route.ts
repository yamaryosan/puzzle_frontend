import prisma from "@/lib/prismaclient";
import { NextRequest, NextResponse } from "next/server";

type FirebaseUser = {
    firebaseUid: string;
    email: string | null;
    displayName: string | null;
}

/**
 * ユーザを更新
 */
export async function PUT(req: NextRequest, { params }: { params: { firebaseUid: string } }) {
    try {
        const firebaseUid = params.firebaseUid;
        const firebaseUser: FirebaseUser = await req.json();

        if (!firebaseUser.firebaseUid || !firebaseUser.email) {
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { firebaseUid },
            data: {
                email: firebaseUser.email,
                name: firebaseUser.displayName,
            },
        });

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
        } else {
            return NextResponse.json({ error: "Unknown error" }, { status: 500 });
        }
    }
}