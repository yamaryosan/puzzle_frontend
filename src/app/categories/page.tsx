'use client';

import { useEffect, useState } from 'react';
import { Category } from '@prisma/client';
import CategoryCard from '@/lib/components/CategoryCard';
import { getCategories } from '@/lib/api/categoryapi';
import RecommendSignInDialog from '@/lib/components/RecommendSignInDialog';
import FirebaseUserContext from '@/lib/context/FirebaseUserContext';
import { useContext } from 'react';

export default function Page() {
    const user = useContext(FirebaseUserContext);
    const [categories, setCategories] = useState<Category[]>([]);

    // アクティブなカードのID
    const [activeCardId, setActiveCardId] = useState<number | null>(null);

    // カテゴリー一覧を取得
    useEffect(() => {
        async function fetchCategories() {
            if (!user) return;
            const categories = await getCategories(user.uid ?? '');
            setCategories(categories || []);
        }
        fetchCategories();
    }, [user, activeCardId]);

    // カードのクリックイベント
    const handleCardClick = (id: number) => {
        setActiveCardId(id === activeCardId ? null : id);
    };

    return (
        <>
        {!user ? (
            <div>
                <RecommendSignInDialog />
            </div>
        ) : (
            categories.length === 0 ? (<p>カテゴリーがありません</p>
            ) : (
            categories.map((category) => (
                <div key={category.id}>
                    <CategoryCard category={category} isActive={category.id === activeCardId} onClick={() => handleCardClick(category.id)}  />
                </div>
            ))
        ))}
        </>
    );
}