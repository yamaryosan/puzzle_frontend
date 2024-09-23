import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PuzzleCard from '@/lib/components/PuzzleCard';
import { Puzzle } from '@prisma/client';

// PuzzleInfoコンポーネントのモック
jest.mock('@/lib/components/PuzzleInfo', () => {
    return function MockPuzzleInfo({ puzzle }: { puzzle: Puzzle }) {
        return <div data-testid="puzzle-info">{`Puzzle: ${puzzle.id}`}</div>;
    };
});

// モックデータ
const mockPuzzle = {
    id: 1,
    title: 'パズルのタイトル',
    description: 'パズルの説明',
    is_solved: false,
    is_favorite: false,
    user_id: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
} as Puzzle;

const mockOnClick = jest.fn();

describe('PuzzleCard', () => {

    test('パズルの情報を表示', async () => {
        render(<PuzzleCard puzzle={mockPuzzle} isActive={false} onClick={mockOnClick} />);

        const puzzleInfo = screen.getByTestId('puzzle-info');
        expect(puzzleInfo).toHaveTextContent('Puzzle: 1');
    });

    test('クリック時にonClick関数が呼ばれる', async () => {
        const ev = userEvent.setup();
        render(<PuzzleCard puzzle={mockPuzzle} isActive={false} onClick={mockOnClick} />);

        const card = screen.getByTestId('puzzle-info').closest('div');
        await ev.click(card as HTMLElement);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
});