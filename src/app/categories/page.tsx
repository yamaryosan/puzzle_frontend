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

    // カテゴリー一覧を取得
    useEffect(() => {
        fetchCategories().then((categories) => {
            setCategories(categories);
        });
    }, []);

    return (
        <>
        {categories.map((category) => (
            <div key={category.id}>
                <Link href={`/categories/${category.id}`}>
                    <CategoryCard category={category} />
                </Link>
            </div>
        ))}
        </>
    );
}