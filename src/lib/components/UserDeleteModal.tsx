import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, Button } from "@mui/material";
import { GoogleAuthProvider, User } from 'firebase/auth';
import { reauthenticateWithPopup } from 'firebase/auth';
import { getAuth } from 'firebase/auth';

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

// 退会処理
const handleDeleteAccount = async (user: User) => {
    const provider = checkAuthProvider(user);
    if (provider === 'email') {
        await user.delete();
    } else if (provider === 'google') {
        const googleProvider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, googleProvider);
        await user.delete();
    }
};

type DeleteModalProps = {
    id: string,
    onButtonClick: (isDelete: boolean) => void;
};

/**
 * 退会確認モーダル
 * @param id 削除対象のID
 * @param onButtonClick ボタンがクリックされたときの処理
 */
export default function UserDeleteModal({ id, onButtonClick }: DeleteModalProps) {
    const router = useRouter();

    // エスケープキーが押されたらモーダルを閉じる
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onButtonClick(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleDelete = async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            console.error('ユーザーが見つかりません');
            return;
        }
        try {
            await handleDeleteAccount(user);
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
                <Box sx={{ marginBottom: "1rem" }}>
                    <p>本当に退会しますか？</p>
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
                            backgroundColor: "error.dark",
                        },
                    }}
                    onClick={() => handleDelete()}>はい</Button>
                </Box>
            </Box>
        </Box>
        </>
    );
}