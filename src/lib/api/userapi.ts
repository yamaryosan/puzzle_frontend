import { User } from "@prisma/client";

type FirebaseUser = {
    firebaseUid: string;
    email: string | null;
    displayName: string | null;
}

/**
 * Prismaにユーザを登録(API)
 * @param firebaseUser Firebaseユーザ
 * @returns Prismaユーザ
 */
export default async function createUserInPrisma(firebaseUser: FirebaseUser) {
    try {
        const response = await fetch("/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(firebaseUser),
        });
        if (!response.ok) {
            // エラーの内容を表示
            const error = await response.json();
            console.error("page: Error creating user in Prisma:", error);
        }
        const user = await response.json();
        console.log("page: User created in Prisma:", user);
        return user as Promise<User>;
    } catch (error) {
        console.error("page: Error creating user in Prisma:", error);
        throw error;
    }
}