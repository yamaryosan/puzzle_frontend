'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Category } from '@prisma/client';

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
        <div>
            {categories.map((category) => (
                <div key={category.id}>
                    <Link href={`/categories/${category.id}`}>
                        {category.name}
                    </Link>
                </div>
            ))}
        </div>
    );
}