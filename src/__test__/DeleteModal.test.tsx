import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    test('削除確認', async () => {
        render(<DeleteModal target="puzzle" id="1" onButtonClick={mockOnButtonClick} />);
        expect(screen.getByText('本当に削除しますか？')).toBeInTheDocument();
    });

    test('パズル削除で「いいえ」ボタンをクリック', async () => {
        const ev = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
        render(<DeleteModal target="puzzle" id="1" onButtonClick={mockOnButtonClick} />);
        const noButton = screen.getByText('いいえ');

        await ev.click(noButton);
        // いいえボタンをクリックしたので、deletePuzzleが呼ばれていないことを確認
        await waitFor(() => {
            expect(deletePuzzle).not.toHaveBeenCalled();
        });
    });

    test('パズル削除で「はい」ボタンをクリック', async () => {
        const ev = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
        render(<DeleteModal target="puzzle" id="1" onButtonClick={mockOnButtonClick} />);
        const yesButton = screen.getByText('はい');
        await waitFor(() => {
            expect(yesButton).toBeDisabled();
        });
        // 2秒待つ
        act (() => {
            jest.advanceTimersByTime(2000);
        });
        // はいボタンが有効化されたのでクリック
        await ev.click(yesButton);
        // はいボタンをクリックしたので、deletePuzzleが呼ばれていることを確認
        await waitFor(() => {
            expect(deletePuzzle).toHaveBeenCalledWith('1');
        });
    });

    test('定石削除で「いいえ」ボタンをクリック', async () => {
        const ev = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
        render(<DeleteModal target="approach" id="1" onButtonClick={mockOnButtonClick} />);
        const noButton = screen.getByText('いいえ');
        await ev.click(noButton);
        // いいえボタンをクリックしたので、deleteApproachが呼ばれていないことを確認
        await waitFor(() => {
            expect(deleteApproach).not.toHaveBeenCalled();
        });
    });

    test('定石削除で「はい」ボタンをクリック', async () => {
        const ev = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
        render(<DeleteModal target="approach" id="1" onButtonClick={mockOnButtonClick} />);
        const yesButton = screen.getByText('はい');
        await waitFor(() => {
            expect(yesButton).toBeDisabled();
        });
        // 2秒待つ
        act (() => {
            jest.advanceTimersByTime(2000);
        });
        // はいボタンが有効化されたのでクリック
        await ev.click(yesButton);
        // はいボタンをクリックしたので、deleteApproachが呼ばれていることを確認
        await waitFor(() => {
            expect(deleteApproach).toHaveBeenCalledWith('1');
        });
    });
    test('エスケープキーが押されるとモーダルが閉じる', async() => {
        const ev = userEvent.setup({advanceTimers: jest.advanceTimersByTime});
        render(<DeleteModal target="puzzle" id="1" onButtonClick={mockOnButtonClick} />);
        // エスケープキーを押す
        await ev.keyboard('{Escape}');
        // エスケープキーを押したので、onButtonClickがfalseで呼ばれていることを確認
        await waitFor(() => {
            expect(mockOnButtonClick).toHaveBeenCalledWith(false);
        });
    });
});