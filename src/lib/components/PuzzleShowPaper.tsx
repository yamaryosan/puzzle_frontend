"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { puzzles, categories } from "@prisma/client";
import Link from "next/link";
import DeleteModal from "@/lib/components/DeleteModal";
import { getPuzzleById } from "@/lib/api/puzzleapi";
import { getCategoriesByPuzzleId } from "@/lib/api/categoryapi";
import { Box, Paper } from "@mui/material";
import Portal from "@/lib/components/Portal";
import { Delete, Edit, EmojiObjects } from "@mui/icons-material";
import FavoriteButton from "@/lib/components/FavoriteButton";
import DifficultViewer from "@/lib/components/DifficultyViewer";
import CompletionStatusIcon from "@/lib/components/CompletionStatusIcon";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { useContext } from "react";
import MessageModal from "@/lib/components/MessageModal";
import CommonButton from "@/lib/components/common/CommonButton";
import CategoryShowPart from "@/lib/components/CategoryShowPart";
import DescriptionViewer from "@/lib/components/DescriptionViewer";
import DeviceTypeContext from "@/lib/context/DeviceTypeContext";

export default function PuzzleShowPaper({ id }: { id: string }) {
    const user = useContext(FirebaseUserContext);

    const [puzzle, setPuzzle] = useState<puzzles | null>(null);
    const [categories, setCategories] = useState<categories[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const deviceType = useContext(DeviceTypeContext);

    // モーダルの表示
    const searchParams = useSearchParams();
    const showCreatedModal = searchParams.get("created") === "true";
    const showEditedModal = searchParams.get("edited") === "true";

    // 削除確認ダイアログの開閉
    const toggleDeleteModal = () => {
        setIsDeleteModalOpen(!isDeleteModalOpen);
    };

    // パズルとカテゴリーを取得
    useEffect(() => {
        async function fetchPuzzleAndCategories() {
            if (!user) return;

            try {
                const [puzzleData, categoriesData] = await Promise.all([
                    getPuzzleById(id, user.uid ?? ""),
                    getCategoriesByPuzzleId(id, user.uid ?? ""),
                ]);
                setPuzzle(puzzleData as puzzles);
                setCategories(categoriesData as categories[]);
                setIsLoading(false);
            } catch (error) {
                console.error("パズルの取得に失敗: ", error);
            }
        }

        fetchPuzzleAndCategories();
    }, [id, user]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {showCreatedModal && (
                <MessageModal message="パズルを作成しました" param="created" />
            )}
            {showEditedModal && (
                <MessageModal message="パズルを編集しました" param="edited" />
            )}

            <Paper sx={{ padding: "1rem" }}>
                {deviceType === "mobile" && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "column",
                            justifyContent: "space-between",
                        }}
                    >
                        <h2 style={{ display: "inline-block" }}>
                            {puzzle?.title}
                        </h2>
                        <Box
                            sx={{
                                display: "flex",
                                gap: "1rem",
                                alignItems: "center",
                            }}
                        >
                            <CompletionStatusIcon
                                isSolved={puzzle?.is_solved ?? false}
                            />
                            <FavoriteButton
                                initialChecked={puzzle?.is_favorite ?? false}
                                puzzleId={id}
                            />
                        </Box>
                    </Box>
                )}

                {deviceType === "desktop" && (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <h2>{puzzle?.title}</h2>
                        <Box
                            sx={{
                                display: "flex",
                                gap: "1rem",
                                alignItems: "center",
                            }}
                        >
                            <CompletionStatusIcon
                                isSolved={puzzle?.is_solved ?? false}
                            />
                            <FavoriteButton
                                initialChecked={puzzle?.is_favorite ?? false}
                                puzzleId={id}
                            />
                        </Box>
                    </Box>
                )}

                <CategoryShowPart categories={categories} />

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        paddingY: "0.5rem",
                    }}
                >
                    <h4>難易度:</h4>
                    <DifficultViewer value={puzzle?.difficulty ?? 0} />
                </Box>

                <DescriptionViewer
                    descriptionHtml={puzzle?.description ?? ""}
                />

                {deviceType === "mobile" && (
                    <Box
                        sx={{
                            display: "flex",
                            gap: "0.5rem",
                            flexDirection: "column",
                        }}
                    >
                        <Link
                            href="/puzzles/[id]/solve"
                            as={`/puzzles/${id}/solve`}
                            style={{ display: "block" }}
                        >
                            <CommonButton
                                color="primary"
                                onClick={() => {}}
                                width="100%"
                            >
                                <EmojiObjects />
                                解く
                            </CommonButton>
                        </Link>

                        <Link
                            href="/puzzles/[id]/edit"
                            as={`/puzzles/${id}/edit`}
                            style={{ display: "block" }}
                        >
                            <CommonButton
                                color="secondary"
                                onClick={() => {}}
                                width="100%"
                            >
                                <Edit />
                                編集
                            </CommonButton>
                        </Link>

                        <CommonButton color="error" onClick={toggleDeleteModal}>
                            <Delete />
                            削除
                        </CommonButton>
                    </Box>
                )}

                {deviceType === "desktop" && (
                    <Box
                        sx={{
                            display: "flex",
                            gap: "1rem",
                            marginTop: "1rem",
                            justifyContent: "space-between",
                        }}
                    >
                        <Link
                            href="/puzzles/[id]/solve"
                            as={`/puzzles/${id}/solve`}
                            style={{ display: "block", width: "30%" }}
                        >
                            <CommonButton
                                color="primary"
                                onClick={() => {}}
                                width="100%"
                            >
                                <EmojiObjects />
                                解く
                            </CommonButton>
                        </Link>

                        <Link
                            href="/puzzles/[id]/edit"
                            as={`/puzzles/${id}/edit`}
                            style={{ display: "block", width: "30%" }}
                        >
                            <CommonButton
                                color="secondary"
                                onClick={() => {}}
                                width="100%"
                            >
                                <Edit />
                                編集
                            </CommonButton>
                        </Link>

                        <CommonButton
                            color="error"
                            onClick={toggleDeleteModal}
                            width="30%"
                        >
                            <Delete />
                            削除
                        </CommonButton>
                    </Box>
                )}

                <div id="delete_modal"></div>
                {isDeleteModalOpen && (
                    <Portal element={document.getElementById("delete_modal")!}>
                        <DeleteModal
                            target="puzzle"
                            id={id ?? 0}
                            onButtonClick={toggleDeleteModal}
                        />
                    </Portal>
                )}
            </Paper>
        </>
    );
}
