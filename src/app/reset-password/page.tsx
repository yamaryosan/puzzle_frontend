"use client";

import CommonPaper from "@/lib/components/common/CommonPaper";
import { useState } from "react";
import { sendPasswordResetEmail, getAuth } from "firebase/auth";
import CommonButton from "@/lib/components/common/CommonButton";
import CommonInputText from "@/lib/components/common/CommonInputText";

export default function Page() {
    const auth = getAuth();
    const [email, setEmail] = useState<string>("");
    const [message, setMessage] = useState<string | null>(null);

    //パスワードリセット用のメールを送信
    const handleSendEmail = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        try {
            const actionCodeSettings = {
                url: `${window.location.origin}/reset-password/auth-action-handler`,
                handleCodeInApp: true,
            };
            await sendPasswordResetEmail(auth, email, actionCodeSettings);
        } catch (error: unknown) {
            if (error instanceof Error) {
            }
        } finally {
            setMessage(
                "パスワードリセット用リンクを送信しました。メールをご確認ください。"
            );
        }
    };

    return (
        <CommonPaper>
            <h2>パスワードリセット</h2>
            <p>パスワードを再設定します。</p>
            <form>
                <label htmlFor="email">メールアドレス</label>
                <CommonInputText
                    elementId="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <CommonButton onClick={handleSendEmail} color="primary">
                    送信
                </CommonButton>
            </form>
            {message && <p>{message}</p>}
        </CommonPaper>
    );
}
