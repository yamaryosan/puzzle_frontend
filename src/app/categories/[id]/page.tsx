'use client';

import Link from 'next/link';
import { getCategoryById, fetchPuzzlesByCategoryId, updateCategory } from '@/lib/api/categoryapi';
import { Puzzle, Category } from '@prisma/client';
import { useEffect, useState } from 'react';

type PageParams = {
    id: string;
};

export default function Page({ params }: { params: PageParams}) {
    const [category, setCategory] = useState<Category | null>(null);
    const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');

    // カテゴリー情報を取得
    useEffect(() => {
        getCategoryById(params.id).then((category) => {
            if (!category) return;
            setCategory(category);
            setEditedName(category.name);
        });
    }, [params.id]);

    // カテゴリーに紐づくパズル一覧を取得
    useEffect(() => {
        fetchPuzzlesByCategoryId(params.id).then((puzzles) => {
            if (!puzzles) return;
            setPuzzles(puzzles);
        });
    }, [params.id]);

    // 編集モードを切り替え
    const toggleEditMode = () => {
        setIsEditing(!isEditing);
    };

    // カテゴリー名を更新
    const handleUpdateCategory = async () => {
        if (!category || editedName.trim() === '') return;
        try {
            const updatedCategory = await updateCategory(category.id.toString(), editedName);
            setCategory(updatedCategory);
            setIsEditing(false);
        } catch (error) {
            console.error('カテゴリーの更新に失敗しました:', error);
        }
    };

    return (
        <div>
            {isEditing ? (
                <div>
                    <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} />
                    <button onClick={handleUpdateCategory}>変更</button>
                    <button onClick={toggleEditMode}>キャンセル</button>
                </div>
            ) : (
                <div>
                    <h1>{category?.name}</h1>
                    <button onClick={toggleEditMode}>編集</button>
                </div>
            )}
            {/* パズル一覧 */}
            <ul>
                {puzzles.length === 0 && <li>パズルがありません</li>}
                {puzzles.map((puzzle) => (
                    <li key={puzzle.id}>
                        <Link href={`/puzzles/${puzzle.id}`}>{puzzle.title}</Link>
                    </li>
                ))}
            </ul>
            <Link href="/categories">カテゴリー一覧に戻る</Link>
        </div>
    );
}