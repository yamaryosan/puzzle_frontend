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


/**
 * パスワードの強度をチェック
 * @param password パスワード
 * @returns エラーメッセージ, 真偽値
 */
export async function checkPasswordStrength(password: string): Promise<{ message: string, isVerified: boolean }> {
    const minLength = 10;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);

    let message = "以下を満たしてください。";
  
    if (password.length < minLength) {
        message += "10文字以上 ";
    }
    if (!hasUpperCase) {
        message += "1文字以上の大文字 ";
    }
    if (!hasLowerCase) {
        message += "1文字以上の小文字 ";
    }
    if (!hasNumbers) {
        message += "1文字以上の数字 ";
    }
    if (!hasNonalphas) {
        message += "1文字以上の記号 ";
    }
    if (message === "以下を満たしてください。") {
        message = "";
    }
    return { message, isVerified: message === "" };
}