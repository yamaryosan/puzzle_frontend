import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
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
    test('削除確認', async () => {
        render(<DeleteModal target="puzzle" id="1" onButtonClick={mockOnButtonClick} />);
        expect(screen.getByText('本当に削除しますか？')).toBeInTheDocument();
    });

    test('パズル削除で「いいえ」ボタンをクリック', async () => {
        const ev = userEvent.setup();
        render(<DeleteModal target="puzzle" id="1" onButtonClick={mockOnButtonClick} />);
        const noButton = screen.getByText('いいえ');

        await ev.click(noButton);
        // いいえボタンをクリックしたので、deletePuzzleが呼ばれていないことを確認
        await waitFor(() => {
            expect(deletePuzzle).not.toHaveBeenCalled();
        });
    });

    test('パズル削除で「はい」ボタンをクリック', async () => {
        const ev = userEvent.setup();
        render(<DeleteModal target="puzzle" id="1" onButtonClick={mockOnButtonClick} />);
        const yesButton = screen.getByText('はい');
        await ev.click(yesButton);
        // はいボタンをクリックしたので、deletePuzzleが呼ばれていることを確認
        await waitFor(() => {
            expect(deletePuzzle).toHaveBeenCalledWith('1');
        });
    });

    test('定石削除で「いいえ」ボタンをクリック', async () => {
        const ev = userEvent.setup();
        render(<DeleteModal target="approach" id="1" onButtonClick={mockOnButtonClick} />);
        const noButton = screen.getByText('いいえ');
        await ev.click(noButton);
        // いいえボタンをクリックしたので、deleteApproachが呼ばれていないことを確認
        await waitFor(() => {
            expect(deleteApproach).not.toHaveBeenCalled();
        });
    });
    test('定石削除で「はい」ボタンをクリック', async () => {
        const ev = userEvent.setup();
        render(<DeleteModal target="approach" id="1" onButtonClick={mockOnButtonClick} />);
        const yesButton = screen.getByText('はい');
        await ev.click(yesButton);
        // はいボタンをクリックしたので、deleteApproachが呼ばれていることを確認
        await waitFor(() => {
            expect(deleteApproach).toHaveBeenCalledWith('1');
        });
    });

    test('エスケープキーを押すとモーダルが閉じる', async () => {
        const ev = userEvent.setup();
        render(<DeleteModal target="puzzle" id="1" onButtonClick={mockOnButtonClick} />);
        // エスケープキーを押す
        await ev.type(screen.getByText('本当に削除しますか？'), '{esc}');
        // エスケープキーを押したので、onButtonClickがfalseで呼ばれていることを確認
        await waitFor(() => {
            expect(mockOnButtonClick).toHaveBeenCalledWith(false);
        });
    });
});