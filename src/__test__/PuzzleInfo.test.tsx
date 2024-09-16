import React, { use } from 'react';
import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import { Puzzle } from '@prisma/client';
import PuzzleInfo from '@/lib/components/PuzzleInfo';
import { forwardRef } from 'react';

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

jest.mock('@/lib/components/Viewer');

jest.mock('@/lib/components/Viewer', () => {
    return function Viewer({ defaultValue }: { defaultValue: string }) {
        return <div>{defaultValue}</div>;
    }
});

describe('PuzzleInfo', () => {
    test('パズルの情報を表示', async () => {
        render(<PuzzleInfo puzzle={mockPuzzle} />);
        const difficulty = screen.getByText('難易度:');
        expect(difficulty).toBeInTheDocument();
        const description = screen.getByText('パズルの説明');
        expect(description).toBeInTheDocument();
    });
});