import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryCard from '@/lib/components/CategoryCard';
import { Category } from '@prisma/client';

// CategoryInfoコンポーネントのモック
jest.mock('@/lib/components/CategoryInfo', () => {
    return function MockCategoryInfo({ category, isActive }: { category: Category; isActive: boolean }) {
        return <div data-testid="category-info">{`Category: ${category.id}, Active: ${isActive}`}</div>;
    };
});

// モックデータ
const mockCategory = {
    id: 1,
    name: 'カテゴリー名',
    createdAt: new Date(),
    updatedAt: new Date(),
} as Category;

const mockOnClick = jest.fn();

describe('CategoryCard', () => {

    test('カテゴリーの情報を表示', async () => {
        render(<CategoryCard category={mockCategory} isActive={false} onClick={mockOnClick} />);

        const categoryInfo = screen.getByTestId('category-info');
        expect(categoryInfo).toHaveTextContent('Category: 1, Active: false');
    });

    test('クリック時にonClick関数が呼ばれる', async () => {
        render(<CategoryCard category={mockCategory} isActive={false} onClick={mockOnClick} />);

        const card = screen.getByTestId('category-info').closest('div');
        fireEvent.click(card as Element);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    }); 
});