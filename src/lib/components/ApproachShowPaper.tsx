"use client";

import { getApproach, getPuzzlesByApproachId } from "@/lib/api/approachApi";
import { useEffect, useState } from "react";
import { approaches, puzzles } from "@prisma/client";
import { useSearchParams } from "next/navigation";
import MessageModal from "@/lib/components/MessageModal";
import { Box } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import DeleteModal from "@/lib/components/DeleteModal";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { useContext } from "react";
import CommonButton from "@/lib/components/common/CommonButton";
import DescriptionViewer from "@/lib/components/DescriptionViewer";
import DeviceTypeContext from "@/lib/context/DeviceTypeContext";
import PuzzleCards from "@/lib/components/PuzzleCards";

export default function ApproachShowPaper({ id }: { id: string }) {
    const user = useContext(FirebaseUserContext);
    const [approach, setApproach] = useState<approaches | null>(null);
    const [puzzles, setPuzzles] = useState<puzzles[] | null>(null);

    const searchParams = useSearchParams();
    const showCreatedModal = searchParams.get("created") === "true";
    const showEditedModal = searchParams.get("edited") === "true";

    // アクティブなカードのID
    const [activeCardId, setActiveCardId] = useState<number | null>(null);

    const router = useRouter();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const deviceType = useContext(DeviceTypeContext);

    // 定石情報を取得
    useEffect(() => {
        async function fetchApproach() {
            if (!user) return;
            const approach = await getApproach(id, user.uid ?? "");
            if (!approach) {
                return;
            }
            setApproach(approach);
        }
        fetchApproach();
    }, [user, id]);

    // 定石に紐づく問題情報を取得
    useEffect(() => {
        async function fetchPuzzles() {
            if (!user) return;
            const puzzles = await getPuzzlesByApproachId(id, user.uid ?? "");
            if (!puzzles) {
                return;
            }
            setPuzzles(puzzles);
        }
        fetchPuzzles();
    }, [user, id]);

    // 定石編集画面へ遷移
    const handleSendButton = () => {
        router.push(`/approaches/${id}/edit`);
    };

    // 削除確認モーダルの表示切り替え
    const toggleDeleteModal = () => {
        setIsDeleteModalOpen(!isDeleteModalOpen);
    };

    // カードのクリックイベント
    const handleCardClick = (id: number) => {
        setActiveCardId(id === activeCardId ? null : id);
    };

    if (!approach) {
        return <div>定石が見つかりません</div>;
    }

    return (
        <>
            {showCreatedModal && (
                <MessageModal message="定石を作成しました" param="created" />
            )}
            {showEditedModal && (
                <MessageModal message="定石を編集しました" param="edited" />
            )}
            {isDeleteModalOpen && (
                <DeleteModal
                    target="approach"
                    id={id}
                    onButtonClick={toggleDeleteModal}
                />
            )}
            <div>
                <h2>{approach.title}</h2>

                <DescriptionViewer descriptionHtml={approach.content} />

                {puzzles?.length === 0 ? (
                    <p style={{ fontSize: "0.8rem" }}>
                        この定石に紐づくパズルはありません
                    </p>
                ) : (
                    <div>
                        <p>この定石に紐づくパズル</p>
                        <PuzzleCards
                            puzzles={puzzles ?? []}
                            activeCardId={activeCardId}
                            handleCardClick={handleCardClick}
                        />
                    </div>
                )}

                {deviceType === "mobile" && (
                    <Box
                        sx={{
                            paddingY: "0.5rem",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: "2rem",
                            width: "100%",
                        }}
                    >
                        <CommonButton
                            color="secondary"
                            onClick={handleSendButton}
                            width="100%"
                        >
                            <Edit />
                            <span>編集</span>
                        </CommonButton>
                        <CommonButton
                            color="error"
                            onClick={toggleDeleteModal}
                            width="100%"
                        >
                            <Delete />
                            <span>削除</span>
                        </CommonButton>
                    </Box>
                )}

                {deviceType === "desktop" && (
                    <Box
                        sx={{
                            paddingY: "0.5rem",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "100%",
                        }}
                    >
                        <CommonButton
                            color="error"
                            onClick={toggleDeleteModal}
                            width="45%"
                        >
                            <Delete />
                            <span>削除</span>
                        </CommonButton>
                        <CommonButton
                            color="secondary"
                            onClick={handleSendButton}
                            width="45%"
                        >
                            <Edit />
                            <span>編集</span>
                        </CommonButton>
                    </Box>
                )}
            </div>
        </>
    );
}
