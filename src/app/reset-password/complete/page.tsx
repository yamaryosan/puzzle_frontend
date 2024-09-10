'use client';

import { getAuth, confirmPasswordReset, User } from "firebase/auth";
import { useState } from "react";
import CommonButton from "@/lib/components/common/CommonButton";
import CommonInputText from "@/lib/components/common/CommonInputText";
import CommonPaper from "@/lib/components/common/CommonPaper";
import { useSearchParams } from "next/navigation";

/**
 * パスワードの再設定完了ページ
 */
export default function Page() {
    const auth = getAuth();
    const [newPassword, setNewPassword] = useState<string>("");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // oobCodeの取得
    const searchParams = useSearchParams();
    const oobCode = searchParams.get("oobCode");
    // パスワードの更新
    const updatePassword = async (newPassword: string) => {
        if (!oobCode) {
            setError("遷移エラーが発生しました。再度お試しください");
            return;
        }
        try {
            await confirmPasswordReset(auth, oobCode, newPassword);
            setMessage("パスワードの更新が完了しました");
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError("パスワードの更新に失敗しました");
            }
        }
    }

    return (
        <>
        <p>パスワードのリセットが完了しました。新しくパスワードを設定してください。</p>
        <label htmlFor="newPassword">新しいパスワード</label>
        <CommonPaper>
            <CommonInputText elementId="newPassword" elementType="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <CommonButton onClick={() => updatePassword(newPassword)} color="primary">
                更新
            </CommonButton>
        </CommonPaper>
        {message && <p>{message}</p>}
        {error && <p>{error}</p>}
        </>
    );
}