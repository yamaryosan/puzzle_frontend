'use client';

import { useEffect, useState } from 'react';
import { Category } from '@prisma/client';
import CategoryCard from '@/lib/components/CategoryCard';
import { getCategories } from '@/lib/api/categoryapi';
import useAuth from '@/lib/hooks/useAuth';

export default function Page() {
    const { userId } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);

    // アクティブなカードのID
    const [activeCardId, setActiveCardId] = useState<number | null>(null);

    // カテゴリー一覧を取得
    useEffect(() => {
        async function fetchCategories() {
            if (!userId) return;
            const categories = await getCategories(userId ?? '');
            setCategories(categories || []);
        }
        fetchCategories();
    }, [userId]);

    // カードのクリックイベント
    const handleCardClick = (id: number) => {
        setActiveCardId(id === activeCardId ? null : id);
    };

    return (
        <>
        {categories.length === 0 && <p>カテゴリーがありません</p>}
        {categories.map((category) => (
            <div key={category.id}>
                <CategoryCard category={category} isActive={category.id === activeCardId} onClick={() => handleCardClick(category.id)}  />
            </div>
        ))}
        </>
    );
}