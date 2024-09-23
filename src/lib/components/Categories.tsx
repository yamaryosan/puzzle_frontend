'use client';

import { useEffect, useState } from 'react';
import { Category } from '@prisma/client';
import CategoryCard from '@/lib/components/CategoryCard';
import { getCategories } from '@/lib/api/categoryapi';
import FirebaseUserContext from '@/lib/context/FirebaseUserContext';
import CategoryIcon from '@mui/icons-material/Category';
import { useContext } from 'react';

export default function Categories() {
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

    // カテゴリーがない場合
    if (categories.length === 0) {
        return <p>カテゴリーがありません</p>;
    }

    return (
        <>
        <h2 style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
            <CategoryIcon />
            カテゴリー一覧
        </h2>
        {categories.map((category) => (
            <div key={category.id}>
                <CategoryCard category={category} isActive={category.id === activeCardId} onClick={() => handleCardClick(category.id)}  />
            </div>
        ))}
        </>
    );
}