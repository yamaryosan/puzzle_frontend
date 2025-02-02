import { useEffect } from "react";
import { Box, Button } from "@mui/material";
import DeviceTypeContext from "@/lib/context/DeviceTypeContext";
import { useContext, useState } from "react";
import { deleteData } from "@/lib/api/dataApi";
import { FirebaseUserContext } from "@/lib/context/FirebaseUserContext";
import { useRouter } from "next/navigation";

type AllDataDeleteModalProps = {
    onButtonClick: (isDelete: boolean) => void;
};

/**
 * 全データ削除確認モーダル
 * @param onButtonClick ボタンがクリックされたときの処理
 */
export default function AllDataDeleteModal({
    onButtonClick,
}: AllDataDeleteModalProps) {
    const user = useContext(FirebaseUserContext);
    const router = useRouter();
    const [isDeleteButtonDisabled, setIsDeleteButtonDisabled] = useState(true);
    const deviceType = useContext(DeviceTypeContext);

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
    }, [onButtonClick]);

    // 2秒後に削除ボタンを有効化
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsDeleteButtonDisabled(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleDelete = async () => {
        onButtonClick(false);
        await deleteData(user?.uid ?? "");
        router.push("/?allDataDeleted=true");
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
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "white",
                        padding: "3rem",
                        width: deviceType === "mobile" ? "90%" : "50%",
                        zIndex: 2,
                        boxShadow: 24,
                        borderRadius: 2,
                        textAlign: "center",
                    }}
                >
                    <Box sx={{ marginBottom: "1rem" }}>
                        <p>本当に削除しますか？</p>
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
                                    backgroundColor: "error.dark",
                                },
                            }}
                            disabled={isDeleteButtonDisabled}
                            onClick={() => {
                                handleDelete();
                            }}
                        >
                            はい
                        </Button>
                    </Box>
                </Box>
            </Box>
        </>
    );
}
