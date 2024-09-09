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
export async function createUserInPrisma(firebaseUser: FirebaseUser) {
    try {
        const response = await fetch("/api/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(firebaseUser),
        });
        if (!response.ok) {
            const error = await response.json();
            console.error("Prismaでのユーザ作成に失敗: ", error);
        }
        const user = await response.json();
        console.log("Prismaでのユーザ更新に成功: ", user);
        return user as Promise<User>;
    } catch (error) {
        console.error("Prismaでのユーザ作成に失敗: ", error);
        throw error;
    }
}

/**
 * ユーザ情報を更新(API)
 * @param firebaseUser Firebaseユーザ
 * @returns Prismaユーザ
 */
export async function updateUserInPrisma(firebaseUser: FirebaseUser) {
    try {
        const response = await fetch(`/api/users/${firebaseUser.firebaseUid}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(firebaseUser),
        });
        if (!response.ok) {
            const error = await response.json();
            console.error("Prismaでのユーザ更新に失敗: ", error);
        }
        const updatedUser = await response.json();
        console.log("Prismaでのユーザ更新に成功: ", updatedUser);
        return updatedUser as Promise<User>;
    } catch (error) {
        console.error("Prismaでのユーザ更新に失敗: ", error);
        throw error;
    }
}

/**
 * ユーザを削除(API)
 * @param firebaseUid FirebaseユーザID
 * @returns 削除したユーザ
 */
export async function deleteUserInPrisma(firebaseUid: string) {
    try {
        const response = await fetch(`/api/users/${firebaseUid}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            const error = await response.json();
            console.error("Prismaでのユーザ削除に失敗: ", error);
        }
        const deletedUser = await response.json();
        console.log("Prismaでのユーザ削除に成功: ", deletedUser);
        return deletedUser as Promise<User>;
    } catch (error) {
        console.error("Prismaでのユーザ削除に失敗: ", error);
        throw error;
    }
}