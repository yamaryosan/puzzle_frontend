'use client';

import Link from 'next/link';
import { getPuzzleById } from '@/lib/api/puzzleapi';
import { getCategoriesByPuzzleId } from '@/lib/api/categoryapi';
import { useEffect, useState, useRef } from 'react';
import Viewer from '@/lib/components/Viewer';
import Quill from 'quill';
import Portal from '@/lib/components/Portal';
import DeleteModal from '@/lib/components/DeleteModal';
import { Category, Puzzle } from '@prisma/client';
import { Box, Button } from '@mui/material';
import { Clear, Delete, Edit, EmojiObjects } from '@mui/icons-material';


type PageParams = {
    id: string;
};

type CategoryWithRelation = {
    id: number;
    puzzle_id: number;
    category_id: number;
    category: Category;
};

export default function Page({ params }: { params: PageParams }) {
    const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
    const [categories, setCategories] = useState<CategoryWithRelation[]>([]);
    const quillRef = useRef<Quill | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // パズルを取得
    useEffect(() => {
        async function fetchPuzzle() {
            try {
                const puzzle = await getPuzzleById(params.id);
                setPuzzle(puzzle);
            } catch (error) {
                console.error("パズルの取得に失敗: ", error);
            }
        }
        fetchPuzzle();
    }, [params.id]);

    // パズルのカテゴリーを取得
    useEffect(() => {
        async function fetchCategories() {
            try {
                const categories = await getCategoriesByPuzzleId(params.id);
                setCategories(categories ?? []);
            } catch (error) {
                console.error("カテゴリーの取得に失敗: ", error);
            }
        }
        fetchCategories();
    }, [params.id]);

    if (!puzzle) {
        return <div>loading...</div>;
    }

    // 削除確認ダイアログの開閉
    const toggleDeleteModal = () => {
        setIsDeleteModalOpen(!isDeleteModalOpen);
    };

    return (
        <Box
        sx={{
            padding: "1rem",
            backgroundColor: "white",
            borderRadius: "5px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
        }}>
            <div id="delete_modal"></div>
            {isDeleteModalOpen && (
                <Portal element={document.getElementById("delete_modal")!}>
                    <DeleteModal id={params.id ?? 0} onButtonClick={toggleDeleteModal} />
                </Portal>
            )}

            <h2>{puzzle.title}</h2>
            <Box
            sx={{
                display: "flex",
                alignItems: "center",
                paddingY: "0.5rem",
            }}
            >
                <h3>カテゴリー: </h3>
                <span>{categories?.map(category => (
                    <span key={category.category_id}>{category.category.name} </span>
                ))}</span>
            </Box>

            <p>難易度 : {puzzle.difficulty}</p>
            <p>お気に入り : {puzzle.is_favorite ? 'YES' : 'NO'}</p>

            <Box
                sx={{
                    paddingY: '0.5rem',
                }}>
                    <h3>問題文</h3>
                    <Viewer readOnly={true} defaultValue={puzzle.description}/>
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
        </Box>
    );
}