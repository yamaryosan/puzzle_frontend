import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryCheckbox from '@/lib/components/CategoryCheckbox';
import { Category } from '@prisma/client';
import { getCategories, createCategory, getCategoriesByPuzzleId } from "@/lib/api/categoryapi";

// getCategories関数のモック
jest.mock('@/lib/api/categoryapi', () => {
    return {
        getCategories: jest.fn(),
        createCategory: jest.fn(),
        getCategoriesByPuzzleId: jest.fn(),
    };
});

// モックデータ
const mockCategories = [
    {
        id: 1,
        name: 'カテゴリー1',
        user_id: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 2,
        name: 'カテゴリー2',
        user_id: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
] as Category[];

const mockOnChange = jest.fn();

describe('CategoryCheckbox', () => {
    test('初期状態でカテゴリー一覧が表示される', async () => {
        (getCategories as jest.Mock).mockResolvedValue(mockCategories);

        await act(async() => {
            render(<CategoryCheckbox userId="1" onChange={mockOnChange} puzzle_id="1" value={[]} />);
        })

        const category1 = await screen.findByText('カテゴリー1');
        const category2 = await screen.findByText('カテゴリー2');
        expect(category1).toBeInTheDocument();
        expect(category2).toBeInTheDocument();
    });

    test('選択中のカテゴリーが表示される', async () => {
        (getCategories as jest.Mock).mockResolvedValue(mockCategories);
        (getCategoriesByPuzzleId as jest.Mock).mockResolvedValue(mockCategories);

        await act(async () => {
            render(<CategoryCheckbox userId="1" onChange={mockOnChange} puzzle_id="1" value={[]} />);
        });

        // 最初はカテゴリー1とカテゴリー2が選択されている
        const category1 = screen.getByLabelText('カテゴリー1');
        const category2 = screen.getByLabelText('カテゴリー2');
        expect(category1).toBeChecked();
        expect(category2).toBeChecked();

        const ev = userEvent.setup();
        // カテゴリー1を選択解除
        await waitFor(() => {
            ev.click(category1);
            expect(category1).not.toBeChecked();
        });
        // カテゴリー2を選択解除
        await waitFor(() => {
            ev.click(category2);
            expect(category2).not.toBeChecked();
        });
    });

    test('新規カテゴリーを入力欄に入力', async () => {
        (getCategories as jest.Mock).mockResolvedValue(mockCategories);

        await act(async () => {
            render(<CategoryCheckbox userId="1" onChange={mockOnChange} puzzle_id="1" value={[]} />);
        });

        const newCategoryInput = screen.getByPlaceholderText('新規カテゴリー');
        const ev = userEvent.setup();
        ev.type(newCategoryInput, 'カテゴリー3');
        await waitFor(() => {
            expect(newCategoryInput).toHaveValue('カテゴリー3');
        });
    });

    test('新規カテゴリーを作成', async () => {
        const newCategory = {
            id: 3,
            name: 'カテゴリー3',
            user_id: "1",
            createdAt: new Date(),
            updatedAt: new Date(),
        } as Category;

        (getCategories as jest.Mock).mockResolvedValue(mockCategories);
        (createCategory as jest.Mock).mockResolvedValue(newCategory);

        await act(async () => {
            render(<CategoryCheckbox userId="1" onChange={mockOnChange} puzzle_id="1" value={[]} />);
        });

        // 新規カテゴリーを入力
        const newCategoryInput = screen.getByPlaceholderText('新規カテゴリー');
        const ev = userEvent.setup();
        await ev.type(newCategoryInput, 'カテゴリー3');
        const createButton = screen.getByLabelText('create');
        await ev.click(createButton);

        // 新規カテゴリーが作成されることを確認
        await waitFor(() => {
            expect(createCategory).toHaveBeenCalledWith('カテゴリー3', '1');
        });

        // onChange が呼ばれることを確認
        await waitFor(() => {
            expect(mockOnChange).toHaveBeenCalledWith([1, 2, 3]);
        });
    });
})