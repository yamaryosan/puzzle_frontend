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
        // 削除前にFirebaseと同期
        await syncUserWithFirebase(firebaseUid);
        // Prismaで削除
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

/**
 * ユーザをFirebaseと同期(レコードが存在しない場合は作成)
 * 削除時のレコードの不整合を防ぐため
 * @param firebaseUid FirebaseユーザID
 * @returns 同期したユーザ
 */
export async function syncUserWithFirebase(firebaseUid: string) {
    try {
        const response = await fetch(`/api/users/${firebaseUid}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ firebaseUid }),
        });
        if (!response.ok) {
            const error = await response.json();
            console.error("Firebaseとのユーザ同期に失敗: ", error);
        }
        const syncedUser = await response.json();
        console.log("Firebaseとのユーザ同期に成功: ", syncedUser);
        return syncedUser as Promise<User>;
    } catch (error) {
        console.error("Firebaseとのユーザ同期に失敗: ", error);
        throw error;
    }
}


/**
 * パスワードの強度をチェック
 * @param password パスワード
 * @returns エラーメッセージの配列, 真偽値
 */
export async function checkPasswordStrength(password: string): Promise<{ messages: string[], isVerified: boolean }> {
    const minLength = 10;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);

    let messages: string[] = [];
  
    if (password.length < minLength) {
        messages.push("10文字以上 ");
    }
    if (!hasUpperCase) {
        messages.push("1文字以上の大文字 ");
    }
    if (!hasLowerCase) {
        messages.push("1文字以上の小文字 ");
    }
    if (!hasNumbers) {
        messages.push("1文字以上の数字 ");
    }
    if (!hasNonalphas) {
        messages.push("1文字以上の記号 ");
    }
    return { messages, isVerified: messages.length === 0 };
}