import { deletePuzzle } from "@/lib/api/puzzleapi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, Button } from "@mui/material";

type TargetType = "puzzle" | "approach";

type DeleteModalProps = {
    target: TargetType,
    id: string,
    onButtonClick: (isDelete: boolean) => void;
};

/**
 * 削除確認モーダル
 * @param target 削除対象
 * @param id 削除対象のID
 * @param onButtonClick ボタンがクリックされたときの処理
 */
export default function DeleteModal({ target, id, onButtonClick }: DeleteModalProps) {
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
        if (target === "puzzle") {
            await deletePuzzle(id);
        } else if (target === "approach") {
            // await deleteApproach(id);
        }
        onButtonClick(true);
        router.push(`/${target}s?deleted=true`);
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
                    <p>本当に削除しますか？</p>
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