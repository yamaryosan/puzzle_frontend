'use client';

import Link from 'next/link';
import { getPuzzleById } from '@/lib/api/puzzleapi';
import { getCategoriesByPuzzleId } from '@/lib/api/categoryapi';
import { useEffect, useState } from 'react';
import Viewer from '@/lib/components/Viewer';
import Portal from '@/lib/components/Portal';
import DeleteModal from '@/lib/components/DeleteModal';
import { Category, Puzzle } from '@prisma/client';
import { Box, Button } from '@mui/material';
import { Clear, Delete, Edit, EmojiObjects } from '@mui/icons-material';
import FavoriteButton from '@/lib/components/FavoriteButton';
import DifficultViewer from '@/lib/components/DifficultyViewer';
import CompletionStatusIcon from '@/lib/components/CompletionStatusIcon';
import useAuth from '@/lib/hooks/useAuth';
import RecommendSignInDialog from '@/lib/components/RecommendSignInDialog';
import { useSearchParams } from 'next/navigation';
import MessageModal from '@/lib/components/MessageModal';

type PageParams = {
    id: string;
};

export default function Page({ params }: { params: PageParams }) {
    const { user, userId } = useAuth();
    const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // モーダルの表示
    const searchParams = useSearchParams();
    const showCreatedModal = searchParams.get('created') === 'true';
    const showEditedModal = searchParams.get('edited') === 'true';

    // パズルを取得
    useEffect(() => {
        async function fetchPuzzle() {
            try {
                if (!userId) return;
                const puzzle = await getPuzzleById(params.id, userId ?? '') as Puzzle;
                setPuzzle(puzzle);
            } catch (error) {
                console.error("パズルの取得に失敗: ", error);
            }
        }
        fetchPuzzle();
    }, [params.id, userId]);

    // パズルのカテゴリーを取得
    useEffect(() => {
        async function fetchCategories() {
            try {
                if (!userId) return;
                const categories = await getCategoriesByPuzzleId(params.id, userId ?? '') as Category[];
                setCategories(categories ?? []);
            } catch (error) {
                console.error("カテゴリーの取得に失敗: ", error);
            }
        }
        fetchCategories();
    }, [params.id]);

    // 削除確認ダイアログの開閉
    const toggleDeleteModal = () => {
        setIsDeleteModalOpen(!isDeleteModalOpen);
    };

    if (!user) {
        return (
            <div>
                <RecommendSignInDialog />
            </div>
        );
    }

    return (
        <>
        {showCreatedModal && (
            <MessageModal message="パズルを作成しました" param="created" />
        )}
        {showEditedModal && (
            <MessageModal message="パズルを編集しました" param="edited" />
        )}
        <Box
        sx={{
            padding: "1rem",
            backgroundColor: "white",
            borderRadius: "5px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
        }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{display: "inline-block"}}>{puzzle?.title}</h2>
                <Box sx={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <CompletionStatusIcon isSolved={puzzle?.is_solved ?? false} />
                    <FavoriteButton
                        initialChecked={puzzle?.is_favorite ?? false}
                        puzzleId={params.id}
                        onChange={(checked) => {
                            setPuzzle({ ...puzzle!, is_favorite: checked });
                        }}/>
                </Box>
            </Box>
            <Box
            sx={{
                display: "flex",
                alignItems: "center",
                paddingY: "0.5rem",
            }}>
                <h3>カテゴリー: </h3>
                <span>{categories?.map(category => (
                    <span key={category.id}>{category.name}</span>
                ))}</span>
            </Box>
            
            <Box sx={{ display: "flex", alignItems: "center", paddingY: "0.5rem" }}>
                <h3>難易度: </h3>
                <DifficultViewer value={puzzle?.difficulty ?? 0} />
            </Box>

            <Box sx={{ paddingY: '0.5rem' }}>
                    <h3>問題文</h3>
                    <Viewer defaultValue={puzzle?.description ?? ''} />
            </Box>

            <Box
            sx={{
                display: "flex",
                gap: "1rem",
                marginTop: "1rem",
                justifyContent: "space-between",
            }}>
                <Link href="/puzzles/[id]/solve" as={`/puzzles/${params.id}/solve`} style={{display: "block", width: "20%"}}>
                <Button
                sx={{
                    padding: '1.5rem',
                    width: '100%',
                    backgroundColor: 'primary.light',
                    ":hover": {
                        backgroundColor: 'primary.main',
                    },
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', scale: "1.4", color: "black" }}>
                        <EmojiObjects />
                        <span>解く</span>
                    </Box>
                </Button>
                </Link>

                <Link href="/puzzles/[id]/edit" as={`/puzzles/${params.id}/edit`} style={{display: "block", width: "20%"}}>
                <Button
                sx={{
                    padding: '1.5rem',
                    backgroundColor: 'secondary.light',
                    width: '100%',
                    ":hover": {
                        backgroundColor: 'secondary.main',
                    },
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', scale: "1.4", color: "black" }}>
                        <Edit />
                        <span>編集</span>
                    </Box>
                </Button>
                </Link>

                <Button
                sx={{
                    padding: '1.5rem',
                    backgroundColor: 'error.light',
                    width: '20%',
                    ":hover": {
                        backgroundColor: 'error.main',
                    },
                }}
                onClick={toggleDeleteModal}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', scale: "1.4", color: "black" }}>
                        {isDeleteModalOpen ? <Clear /> : <Delete />}
                    </Box>
                </Button>
            </Box>
            <div id="delete_modal"></div>
            {isDeleteModalOpen && (
                <Portal element={document.getElementById("delete_modal")!}>
                    <DeleteModal target="puzzle" id={params.id ?? 0} onButtonClick={toggleDeleteModal} />
                </Portal>
            )}            
        </Box>
        </>
    );
}