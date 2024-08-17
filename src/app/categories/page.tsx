'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Category } from '@prisma/client';
import { Box } from '@mui/material';
import CategoryCard from '@/lib/components/CategoryCard';

/**
 * カテゴリー一覧を表示
 * @returns 
 */
async function fetchCategories() {
    try {
        const response = await fetch("/api/categories");
        if (!response.ok) {
            const error = await response.json();
            console.error("カテゴリーの取得に失敗: ", error);
        }
        const categories = await response.json();
        return categories;
    } catch (error) {
        console.error("カテゴリーの取得に失敗: ", error);
    }
}

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);

    // アクティブなカードのID
    const [activeCardId, setActiveCardId] = useState<number | null>(null);

    // カテゴリー一覧を取得
    useEffect(() => {
        fetchCategories().then((categories) => {
            setCategories(categories);
        });
    }, []);

    // カードのクリックイベント
    const handleCardClick = (id: number) => {
        setActiveCardId(id === activeCardId ? null : id);
    };

    return (
        <>
        {categories.map((category) => (
            <div key={category.id}>
                <CategoryCard category={category} isActive={category.id === activeCardId} onClick={() => handleCardClick(category.id)}  />
            </div>
        ))}
        </>
    );
}