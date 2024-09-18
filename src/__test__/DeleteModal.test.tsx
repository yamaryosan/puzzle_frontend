import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { deletePuzzle } from "@/lib/api/puzzleapi";
import { deleteApproach } from "@/lib/api/approachApi";
import DeleteModal from '@/lib/components/DeleteModal';

// useRouterのモック
jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));
// API関数のモック
jest.mock('@/lib/api/puzzleapi', () => ({
    deletePuzzle: jest.fn(),
}));
jest.mock('@/lib/api/approachApi', () => ({
    deleteApproach: jest.fn(),
}));

const mockOnButtonClick = jest.fn();

describe('DeleteModal', () => {
    test('削除確認', async () => {
        render(<DeleteModal target="puzzle" id="1" onButtonClick={mockOnButtonClick} />);
        expect(screen.getByText('本当に削除しますか？')).toBeInTheDocument();
    });
    test('パズル削除で「いいえ」ボタンをクリック', async () => {
        render(<DeleteModal target="puzzle" id="1" onButtonClick={mockOnButtonClick} />);
        const noButton = screen.getByText('いいえ');
        fireEvent.click(noButton);
        // いいえボタンをクリックしたので、deletePuzzleが呼ばれていないことを確認
        await waitFor(() => {
            expect(deletePuzzle).not.toHaveBeenCalled();
        });
    });
    test('パズル削除で「はい」ボタンをクリック', async () => {
        render(<DeleteModal target="puzzle" id="1" onButtonClick={mockOnButtonClick} />);
        const yesButton = screen.getByText('はい');
        fireEvent.click(yesButton);
        // はいボタンをクリックしたので、deletePuzzleが呼ばれていることを確認
        await waitFor(() => {
            expect(deletePuzzle).toHaveBeenCalledWith('1');
        });
    });
    test('定石削除で「いいえ」ボタンをクリック', async () => {
        render(<DeleteModal target="approach" id="1" onButtonClick={mockOnButtonClick} />);
        const noButton = screen.getByText('いいえ');
        fireEvent.click(noButton);
        // いいえボタンをクリックしたので、deleteApproachが呼ばれていないことを確認
        await waitFor(() => {
            expect(deleteApproach).not.toHaveBeenCalled();
        });
    });
    test('定石削除で「はい」ボタンをクリック', async () => {
        render(<DeleteModal target="approach" id="1" onButtonClick={mockOnButtonClick} />);
        const yesButton = screen.getByText('はい');
        fireEvent.click(yesButton);
        // はいボタンをクリックしたので、deleteApproachが呼ばれていることを確認
        await waitFor(() => {
            expect(deleteApproach).toHaveBeenCalledWith('1');
        });
    });
    test('エスケープキーを押すとモーダルが閉じる', async () => {
        render(<DeleteModal target="puzzle" id="1" onButtonClick={mockOnButtonClick} />);
        fireEvent.keyDown(window, { key: 'Escape' });
        // エスケープキーを押したので、onButtonClickがfalseで呼ばれていることを確認
        await waitFor(() => {
            expect(mockOnButtonClick).toHaveBeenCalledWith(false);
        });
    });
});