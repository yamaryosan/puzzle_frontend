import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, Button } from "@mui/material";
import { GoogleAuthProvider, User, sendEmailVerification } from 'firebase/auth';
import { reauthenticateWithPopup } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { useState } from "react";
import { deleteUserInPrisma } from "@/lib/api/userapi";

const isEmulator = process.env.NODE_ENV === 'development';

/**
 * 認証方法を判定
 * @param user ユーザー
 * @returns 認証方法
 */
function checkAuthProvider(user: User) {
    if (!user) {
        throw new Error('ユーザーが見つかりません');
    }
    if (user.providerData.length === 0) {
        throw new Error('認証方法が見つかりません');
    }
    const provider = user.providerData[0].providerId;
    switch (provider) {
        case 'password':
            return 'email';
        case 'google.com':
            return 'google';
        default:
            throw new Error('未対応の認証方法です');
    }
}

/** ユーザーアカウントを削除
 * @param user ユーザー
 */
const deleteAccount = async (user: User) => {
    // Firebase Authからユーザーを削除
    const provider = checkAuthProvider(user);
    if (provider === 'email') {
        if (!user.email) {
            throw new Error('メールアドレスが見つかりません');
        }
        // const credential = EmailAuthProvider.credential(user.email, 'password');
        // await reauthenticateWithCredential(user, credential);
        // ローカル環境の場合はユーザーを削除、本番環境の場合はメールアドレス認証を送信
        if (isEmulator) {
            await user.delete();
            await deleteUserInPrisma(user.uid);
        } else {
            const actionCodeSettings = {
                url: "http://localhost:3000/reauthenticate-for-delete",
                handleCodeInApp: true,
            }
            await sendEmailVerification(user, actionCodeSettings);
        }
    } else if (provider === 'google') {
        const googleProvider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, googleProvider);
        await user.delete();
        await deleteUserInPrisma(user.uid);
    } else {
        throw new Error('未対応の認証方法です');
    }
};

type DeleteModalProps = {
    onButtonClick: (isDelete: boolean) => void;
};

/**
 * 退会確認モーダル
 * @param onButtonClick ボタンがクリックされたときの処理
 */
export default function UserDeleteModal({ onButtonClick }: DeleteModalProps) {
    const router = useRouter();

    // 退会確認ステップ
    const [deletionConfirmStep, setDeletionConfirmStep] = useState(0);
    // 最終段階削除ボタンのクリック可能状態
    const [isDeleteButtonDisabled, setIsDeleteButtonDisabled] = useState(true);

    // エスケープキーが押されたらモーダルを閉じる
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onButtonClick(false);
                setDeletionConfirmStep(0);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // 5秒後に退会ボタンを有効化
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsDeleteButtonDisabled(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    // 退会処理(1段階目)
    const handleDelete = async () => {
        if (deletionConfirmStep === 0) {
            setDeletionConfirmStep(1);
            return;
        }
        if (deletionConfirmStep === 1) {
            await deleteUser();
            return;
        }
    };

    // 退会処理(最終段階)
    const deleteUser = async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            console.error('ユーザーが見つかりません');
            return;
        }
        try {
            await deleteAccount(user);
            router.push('/signin?deleted=true');
        } catch (error) {
            console.error('退会処理に失敗: ', error);
        }
    };

    return (
        <>
        <Box
        sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 2,
        }}>
            <Box
            sx={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "white",
                padding: "3rem",
                zIndex: 2,
                boxShadow: 24,
                borderRadius: 2,
                textAlign: "center",
            }}
            >
                {deletionConfirmStep === 0 && (
                    <>
                    <Box sx={{ marginBottom: "1rem" }}>
                        <p>退会しますか？</p>
                    </Box>
                    <Box sx={{scale: "1.5"}}>
                        <Button
                        sx={{
                            marginRight: "1rem",
                            backgroundColor: "success.light",
                            color: "white",
                            ":hover": {
                                backgroundColor: "success.dark",
                            },
                        }}
                        onClick={() => onButtonClick(false)}>いいえ</Button>
                        <Button
                        sx={{
                            backgroundColor: "error.light",
                            color: "white",
                            ":hover": {
                                backgroundColor: "error.main",
                            },
                        }}
                        onClick={() => handleDelete()}>はい</Button>
                    </Box>
                    </>
                )}

                {deletionConfirmStep === 1 && (
                    <>
                    <Box sx={{ marginBottom: "1rem" }}>
                        <p>本当に退会しますか？(この操作は取り消せません)</p>
                    </Box>
                    <Box sx={{scale: "1.5"}}>
                        <Button
                        sx={{
                            marginRight: "1rem",
                            backgroundColor: "success.light",
                            color: "white",
                            ":hover": {
                                backgroundColor: "success.dark",
                            },
                        }}
                        onClick={() => onButtonClick(false)}>いいえ</Button>
                        <Button
                        sx={{
                            backgroundColor: "error.light",
                            color: "white",
                            ":hover": {
                                backgroundColor: "error.main",
                            },
                            ":disabled": {
                                backgroundColor: "error.dark",
                            }
                        }}
                        onClick={() => handleDelete()}
                        disabled={isDeleteButtonDisabled}>はい</Button>
                    </Box>
                    </>
                )}                


            </Box>
        </Box>
        </>
    );
}