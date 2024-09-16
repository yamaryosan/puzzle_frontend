import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import CategoryInfo from '@/lib/components/CategoryInfo';
import { Category } from '@prisma/client';
import { updateCategory } from "@/lib/api/categoryapi";
import { fetchPuzzlesByCategoryId } from "@/lib/api/categoryapi";
import FirebaseUserContext from '@/lib/context/FirebaseUserContext';
import { User } from 'firebase/auth';

// 関数のモック
jest.mock('@/lib/api/categoryapi', () => {
    return {
        updateCategory: jest.fn(),
        fetchPuzzlesByCategoryId: jest.fn().mockResolvedValue([]),
    };
});
jest.mock('firebase/auth');

// モックデータ
const mockCategory = {
    id: 1,
    name: 'カテゴリー1',
    user_id: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
} as Category;

const mockUser = {
    uid: '1',
} as User;

describe('CategoryInfo', () => {
    test('ユーザーがログインしていない場合', async() => {
        render(
            <FirebaseUserContext.Provider value={null}>
                <CategoryInfo category={mockCategory} isActive={true} />
            </FirebaseUserContext.Provider>
        );
        const message = screen.queryByText('カテゴリー1');
        expect(message).not.toBeInTheDocument();
    });

    test('初期状態', async() => {
        render(<CategoryInfo category={mockCategory} isActive={false} />);
        const categoryName = screen.getByText('カテゴリー1');
        expect(categoryName).toBeInTheDocument();
    })

    test('編集ボタンをクリックしてカテゴリー名を変更', async() => {
        render(<CategoryInfo category={mockCategory} isActive={true} />);
        const editButton = screen.getByTestId('EditIcon');
        fireEvent.click(editButton);
        const input = screen.getByRole('textbox');
        expect(input).toBeInTheDocument();
        fireEvent.change(input, { target: { value: 'カテゴリー2' } });
        const updateButton = screen.getByTestId('UpdateIcon');
        fireEvent.click(updateButton);
        await waitFor(() => {
            expect(updateCategory).toHaveBeenCalledWith('1', 'カテゴリー2');
        });
    });

    test('カテゴリーに紐づくパズルがない場合', async() => {
        render(<CategoryInfo category={mockCategory} isActive={true} />);
        const message = screen.queryByText('このカテゴリーに紐づくパズルはありません');
        expect(message).toBeInTheDocument();
    });

    test('カテゴリーに紐づくパズルがある場合', async() => {
        const mockPuzzles = [
            {
                id: 1,
                title: 'パズル1',
                user_id: "1",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                title: 'パズル2',
                user_id: "1",
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        ];
        (fetchPuzzlesByCategoryId as jest.Mock).mockResolvedValue(mockPuzzles);

        await act(async () => {
            render(
            <FirebaseUserContext.Provider value={mockUser}>
                <CategoryInfo category={mockCategory} isActive={true} />
            </FirebaseUserContext.Provider>);
        });
        const puzzle = await screen.findByText('パズル1');
        expect(puzzle).toBeInTheDocument();
    });
});