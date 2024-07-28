import { deletePuzzle } from "@/lib/api/puzzleapi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type DeleteModalProps = {
    id: string,
    onButtonClick: (isDelete: boolean) => void;
};

/**
 * 削除確認モーダル
 * @param id パズルID
 * @param onButtonClick ボタンがクリックされたときの処理
 */
export default function DeleteModal({ id, onButtonClick }: DeleteModalProps) {
    // ルーターを取得
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
        await deletePuzzle(id);
        onButtonClick(true);
        router.push("/puzzles");
    };

    return (
        <div className="bg-white p-4 shadow-lg rounded-lg">
        <p>本当に削除しますか？</p>
        <button onClick={() => handleDelete()}>はい</button>
        <button onClick={() => onButtonClick(false)}>いいえ</button>
        </div>
    );
}