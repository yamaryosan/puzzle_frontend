import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, Button, Input } from "@mui/material";
import { GoogleAuthProvider, User } from "firebase/auth";
import { reauthenticateWithPopup } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { useState } from "react";
import { deleteUserInPrisma } from "@/lib/api/userapi";
import DeviceTypeContext from "@/lib/context/DeviceTypeContext";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { useContext } from "react";
import { CancelOutlined } from "@mui/icons-material";
import { reauthenticateWithCredential } from "firebase/auth";
import { EmailAuthProvider } from "firebase/auth";

const isEmulator = process.env.NODE_ENV === "development";

/**
 * 認証方法を判定
 * @param user ユーザー
 * @returns 認証方法
 */
function checkAuthProvider(user: User) {
    if (!user) {
        throw new Error("ユーザーが見つかりません");
    }
    if (user.providerData.length === 0) {
        throw new Error("認証方法が見つかりません");
    }
    const provider = user.providerData[0].providerId;
    switch (provider) {
        case "password":
            return "email";
        case "google.com":
            return "google";
        default:
            throw new Error("未対応の認証方法です");
    }
}

/** ユーザーアカウントを削除
 * @param user ユーザー
 */
const deleteAccount = async (user: User, password?: string) => {
    // Firebase Authからユーザーを削除
    const provider = checkAuthProvider(user);
    if (provider === "email") {
        if (!user.email) {
            throw new Error("メールアドレスが見つかりません");
        }
        // ローカル環境の場合はユーザーを削除、本番環境の場合はメールアドレス認証を送信
        if (isEmulator) {
            try {
                if (!password) {
                    throw new Error("パスワードが見つかりません");
                }
                await user.delete();
                await deleteUserInPrisma(user.uid);
            } catch (error) {
                throw new Error("ユーザー削除に失敗しました");
            }
        } else {
            if (!user.email) {
                throw new Error("メールアドレスが見つかりません");
            }
            if (!password) {
                throw new Error("パスワードが見つかりません");
            }
            // ポートフォリオチェック用アカウントの削除を許可しない
            if (password !== process.env.PORTFOLIO_CHECK_EMAIL) {
                throw new Error("このアカウントは削除できません");
            }
            const credential = EmailAuthProvider.credential(
                user.email,
                password
            );
            try {
                await reauthenticateWithCredential(user, credential);
                await user.delete();
                await deleteUserInPrisma(user.uid);
            } catch (error) {
                throw new Error("パスワードが間違っています");
            }
        }
    } else if (provider === "google") {
        const googleProvider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, googleProvider);
        await user.delete();
        await deleteUserInPrisma(user.uid);
    } else {
        throw new Error("未対応の認証方法です");
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
    const user = useContext(FirebaseUserContext);

    const [inputName, setInputName] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState<string | null>(null);

    const deviceType = useContext(DeviceTypeContext);

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
    }, [onButtonClick]);

    // 3秒後に退会ボタンを有効化
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsDeleteButtonDisabled(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // 退会処理(1段階目)
    const handleDelete = async (password: string) => {
        if (deletionConfirmStep === 0) {
            setDeletionConfirmStep(1);
            return;
        }
        if (deletionConfirmStep === 1) {
            await deleteUser(password);
            return;
        }
    };

    // 退会処理(最終段階)
    const deleteUser = async (password: string) => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            console.error("ユーザーが見つかりません");
            return;
        }
        try {
            await deleteAccount(user, password);
            router.push("/signin?deleted=true");
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message);
            }
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
                }}
            >
                <Box
                    sx={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        width: deviceType === "mobile" ? "90%" : "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "white",
                        padding: "2rem",
                        zIndex: 2,
                        boxShadow: 24,
                        borderRadius: 2,
                    }}
                >
                    {deletionConfirmStep === 0 && (
                        <>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}
                            >
                                <Box sx={{ marginBottom: "1rem" }}>
                                    <p>退会しますか？</p>
                                </Box>
                                <Box sx={{ scale: "1.5" }}>
                                    <Button
                                        sx={{
                                            marginRight: "1rem",
                                            backgroundColor: "success.light",
                                            color: "white",
                                            ":hover": {
                                                backgroundColor: "success.dark",
                                            },
                                        }}
                                        onClick={() => onButtonClick(false)}
                                    >
                                        いいえ
                                    </Button>
                                    <Button
                                        sx={{
                                            backgroundColor: "error.light",
                                            color: "white",
                                            ":hover": {
                                                backgroundColor: "error.main",
                                            },
                                        }}
                                        onClick={() => handleDelete(password)}
                                    >
                                        はい
                                    </Button>
                                </Box>
                            </Box>
                        </>
                    )}

                    {deletionConfirmStep === 1 && (
                        <>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    marginBottom: "1rem",
                                }}
                            >
                                <Button onClick={() => onButtonClick(false)}>
                                    <CancelOutlined />
                                </Button>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: "1rem",
                                        marginBottom: "1rem",
                                    }}
                                >
                                    退会するには、ユーザ名とパスワードを入力してください
                                </p>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "1rem",
                                        marginBottom: "1rem",
                                        width: "100%",
                                    }}
                                >
                                    <Input
                                        type="text"
                                        placeholder={user?.displayName ?? ""}
                                        value={inputName}
                                        onChange={(e) =>
                                            setInputName(e.target.value)
                                        }
                                    />
                                    <Input
                                        type="password"
                                        placeholder="パスワード"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                    />
                                    <Button
                                        sx={{
                                            backgroundColor: "error.light",
                                            color: "white",
                                            ":hover": {
                                                backgroundColor: "error.main",
                                            },
                                        }}
                                        disabled={
                                            inputName !== user?.displayName ||
                                            password === ""
                                        }
                                        onClick={() => handleDelete(password)}
                                    >
                                        退会
                                    </Button>
                                    {error && <p>{error}</p>}
                                </Box>
                            </Box>
                        </>
                    )}
                </Box>
            </Box>
        </>
    );
}
