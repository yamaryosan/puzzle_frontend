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
                const categories = await getCategoriesByPuzzleId(parseInt(params.id));
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
        <div>
            <button onClick={toggleDeleteModal}>
                {isDeleteModalOpen ? "削除確認ダイアログを閉じる" : "削除確認ダイアログを開く"}
            </button>
            <div className="fixed top-20 left-20" id="delete_modal"></div>
            {isDeleteModalOpen && (
                <Portal element={document.getElementById("delete_modal")!}>
                    <DeleteModal id={params.id ?? 0} onButtonClick={toggleDeleteModal} />
                </Portal>
            )}
            <h1>{puzzle?.title}</h1>
            <p>本文</p>
            <p>{puzzle.description}</p>
            <Viewer 
            readOnly={true}
            defaultValue={puzzle.description}
            ref={quillRef}
            />
            <p>難易度 : {puzzle.difficulty}</p>
            <p>お気に入り : {puzzle.is_favorite ? 'YES' : 'NO'}</p>
            <p>カテゴリー : {categories.map((category) => category.category.name).join(", ")}</p>
            <Link href="/puzzles/[id]/edit" as={`/puzzles/${params.id}/edit`}>(管理者のみ)編集</Link>
            <Link href="/puzzles/[id]/solve" as={`/puzzles/${params.id}/solve`}>解く</Link>
            <Link href="/puzzles">戻る</Link>
        </div>
    );
}