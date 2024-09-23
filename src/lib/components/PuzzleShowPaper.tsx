'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Puzzle, Category } from '@prisma/client';
import Link from 'next/link';
import DeleteModal from '@/lib/components/DeleteModal';
import { getPuzzleById } from '@/lib/api/puzzleapi';
import { getCategoriesByPuzzleId } from '@/lib/api/categoryapi';
import { Box, Button, Paper } from '@mui/material';
import Viewer from '@/lib/components/Viewer';
import Portal from '@/lib/components/Portal';
import { Clear, Delete, Edit, EmojiObjects } from '@mui/icons-material';
import FavoriteButton from '@/lib/components/FavoriteButton';
import DifficultViewer from '@/lib/components/DifficultyViewer';
import CompletionStatusIcon from '@/lib/components/CompletionStatusIcon';
import FirebaseUserContext from '@/lib/context/FirebaseUserContext';
import { useContext } from 'react';
import Delta from 'quill-delta';
import MessageModal from '@/lib/components/MessageModal';
import CommonButton from '@/lib/components/common/CommonButton';
import CategoryShowPart from '@/lib/components/CategoryShowPart';


export default function PuzzleShowPaper({ id }: { id: string }) {
    const user = useContext(FirebaseUserContext);

    const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
    const [descriptionDelta, setDescriptionDelta] = useState<Delta>();
    const [categories, setCategories] = useState<Category[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    // モーダルの表示
    const searchParams = useSearchParams();
    const showCreatedModal = searchParams.get('created') === 'true';
    const showEditedModal = searchParams.get('edited') === 'true';


    // 削除確認ダイアログの開閉
    const toggleDeleteModal = () => {
        setIsDeleteModalOpen(!isDeleteModalOpen);
    };

    // パズルを取得
    useEffect(() => {
        async function fetchPuzzle() {
            try {
                if (!user) return;
                const puzzle = await getPuzzleById(id, user.uid ?? '') as Puzzle;
                setPuzzle(puzzle);
                const module = await import('quill');
                const Delta = module.default.import('delta');
                const quill = new module.default(document.createElement('div'));
                const descriptionDelta = quill.clipboard.convert({ html: puzzle.description });
                setDescriptionDelta(new Delta(descriptionDelta.ops));
                setIsLoading(false);
            } catch (error) {
                console.error("パズルの取得に失敗: ", error);
            }
        }
        fetchPuzzle();
    }, [id, isLoading]);

    // パズルのカテゴリーを取得
    useEffect(() => {
        async function fetchCategories() {
            try {
                if (!user) return;
                const categories = await getCategoriesByPuzzleId(id, user.uid ?? '') as Category[];
                setCategories(categories ?? []);
            } catch (error) {
                console.error("カテゴリーの取得に失敗: ", error);
            }
        }
        fetchCategories();
    }, [id]);

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
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{display: "inline-block"}}>{puzzle?.title}</h2>
                <Box sx={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <CompletionStatusIcon isSolved={puzzle?.is_solved ?? false} />
                    <FavoriteButton
                        initialChecked={puzzle?.is_favorite ?? false}
                        puzzleId={id}
                        onChange={(checked) => {
                            setPuzzle({ ...puzzle!, is_favorite: checked });
                        }}/>
                </Box>
            </Box>

            <CategoryShowPart categories={categories} />
            
            <Box sx={{ display: "flex", alignItems: "center", paddingY: "0.5rem" }}>
                <h3>難易度: </h3>
                <DifficultViewer value={puzzle?.difficulty ?? 0} />
            </Box>

            <Box sx={{ paddingY: '0.5rem' }}>
                    <h3>問題文</h3>
                    <Viewer defaultValue={descriptionDelta ?? new Delta()} />
            </Box>

            <Box sx={{ display: "flex", gap: "1rem", marginTop: "1rem", justifyContent: "space-between" }}>
                <Link href="/puzzles/[id]/solve" as={`/puzzles/${id}/solve`} style={{display: "block", width: "30%"}}>
                <CommonButton color="primary" onClick={() => {}} width="100%" >
                    <EmojiObjects />
                    解く
                </CommonButton>
                </Link>

                <Link href="/puzzles/[id]/edit" as={`/puzzles/${id}/edit`} style={{display: "block", width: "30%"}}>
                <CommonButton color="secondary" onClick={() => {}} width="100%" >
                    <Edit />
                    編集
                </CommonButton>
                </Link>

                <CommonButton color="error" onClick={toggleDeleteModal} width="30%" >
                    <Delete />
                    削除
                </CommonButton>
            </Box>

            <div id="delete_modal"></div>
            {isDeleteModalOpen && (
                <Portal element={document.getElementById("delete_modal")!}>
                    <DeleteModal target="puzzle" id={id ?? 0} onButtonClick={toggleDeleteModal} />
                </Portal>
            )}            
        </Paper>
        </>
    );        
}