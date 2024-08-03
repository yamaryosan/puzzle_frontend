'use client';

import Link from 'next/link';
import { getCategoryById, fetchPuzzlesByCategoryId } from '@/lib/api/categoryapi';
import { Puzzle, Category } from '@prisma/client';
import { useEffect, useState } from 'react';

type PageParams = {
    id: string;
};

export default function Page({ params }: { params: PageParams}) {
    const [category, setCategory] = useState<Category | null>(null);
    const [puzzles, setPuzzles] = useState<Puzzle[]>([]);

    // カテゴリー情報を取得
    useEffect(() => {
        getCategoryById(params.id).then((category) => {
            if (!category) return;
            setCategory(category);
        });
    }, [params.id]);

    // カテゴリーに紐づくパズル一覧を取得
    useEffect(() => {
        fetchPuzzlesByCategoryId(params.id).then((puzzles) => {
            if (!puzzles) return;
            setPuzzles(puzzles);
        });
    }, [params.id]);

    return (
        <div>
            <p>カテゴリー: {params.id}</p>
        </div>
    );
}