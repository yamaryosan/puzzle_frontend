'use client';

import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import firebaseApp from "../firebase";
import { isSignInWithEmailLink, signInWithEmailLink, updatePassword, updateProfile } from "firebase/auth";
import { createUserInPrisma, checkPasswordStrength } from "@/lib/api/userapi";
import CommonPaper from "@/lib/components/common/CommonPaper";
import CommonInputText from "@/lib/components/common/CommonInputText";
import CommonButton from "@/lib/components/common/CommonButton";
import { Box } from "@mui/material";
import { HowToRegOutlined, ErrorOutline } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { createDefaultPuzzles } from '@/lib/api/puzzleapi';

/**
 * メールアドレスリンクからの登録完了ページ
 * @returns 
 */
export default function Page() {
    const auth = getAuth(firebaseApp);
    const [email, setEmail] = useState<string>("");
    const [displayName, setDisplayName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [generalError, setGeneralError] = useState<string>("");

    const [isSent, setIsSent] = useState<boolean>(false);

    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
    const [isVerified, setIsVerified] = useState<boolean>(false);

    const router = useRouter();

    // メールアドレスをローカルストレージから取得
    useEffect(() => {
        const storedEmail = window.localStorage.getItem("emailForSignIn");
        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, []);


    
    useEffect(() => {
        const validatePassword = async () => {
            const { messages, isVerified } = await checkPasswordStrength(password);
            setPasswordErrors(messages);
            setIsVerified(isVerified);
        };
        validatePassword();
    }, [password]);

    // フォームを送信
    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if (!isVerified) {
            setGeneralError("パスワードに誤りがあります");
            return;
        }
        if (displayName.trim() === "") {
            setGeneralError("ユーザ名を入力してください");
            return;
        }
        if (!email) {
            setGeneralError("メールアドレスが取得できませんでした");
            return;
        }
        setIsSent(true);
        // メールリンクからのログインか確認
        if (isSignInWithEmailLink(auth, window.location.href)) {
            try {
                const result = await signInWithEmailLink(auth, email, window.location.href);
                // プロフィール(ユーザ名)を更新
                await updateProfile(result.user, {
                    displayName: displayName,
                });
                // パスワードを更新
                await updatePassword(result.user, password);

                // ユーザをPrismaに登録
                const firebaseUser = {
                    firebaseUid: result.user.uid,
                    email: result.user.email,
                    displayName: result.user.displayName,
                };
                await createUserInPrisma(firebaseUser);
                // デフォルトのパズルを登録
                await createDefaultPuzzles(result.user.uid);

                window.localStorage.removeItem("emailForSignIn");
                router.push("/?userCreated=true");
            } catch (error) {
                if (error instanceof FirebaseError) {
                    if (error.code === "auth/invalid-action-code") {
                        setGeneralError("メールアドレスが無効です");
                    }
                    setIsSent(false);
                }
            }
        }
    }

    return (
        <>
        <CommonPaper>
            <Box component="form">
                <p>{email}でユーザ登録します</p>
                <Box sx={{ marginTop: "1rem" }}>
                    <CommonInputText
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="ユーザ名"/>
                </Box>
                <Box sx={{ marginTop: "0.5rem" }}>
                    <CommonInputText
                        elementType="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="パスワード"/>
                </Box>
                {(passwordErrors.length > 0 && password.length > 0) &&
                <Box sx={{ color: "error.main", display: "flex", gap: "0.5rem"}}>
                    <ErrorOutline />
                    <ul>
                        {passwordErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </Box>}
                <Box sx={{ marginTop: "1rem" }}>
                    <CommonButton onClick={handleSubmit} color="primary" disabled={isSent}>
                        <HowToRegOutlined />
                        登録完了
                    </CommonButton>
                </Box>
            </Box>
            {generalError && 
            <Box component="span" sx={{ color: "error.main", display: "flex", gap: "0.5rem" }}>
                <ErrorOutline />
                {generalError}
            </Box>}
        </CommonPaper>
        </>
    );
};