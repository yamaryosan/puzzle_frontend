import React, { use } from 'react';
import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import { Puzzle } from '@prisma/client';
import PuzzleInfo from '@/lib/components/PuzzleInfo';

// モックデータ
const mockPuzzle = {
    id: 1,
    title: 'パズルのタイトル',
    description: 'パズルの説明',
    is_solved: false,
    is_favorite: false,
    difficulty: 1,
    user_id: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
} as Puzzle;

jest.mock('@/lib/components/DifficultyViewer', () => {
    return function DifficultyViewer({ value }: { value: number }) {
        return (
            <span>{value}</span>
        )
    }
});

jest.mock('@/lib/components/DescriptionViewer', () => {
    return function DescriptionViewer({ descriptionHtml }: { descriptionHtml: string }) {
        return (
            <div>
                <h3>本文</h3>
                <p>{descriptionHtml}</p>
            </div>
        )
    }
});

describe('PuzzleInfo', () => {
    test('パズルの情報を表示', () => {
        render(<PuzzleInfo puzzle={mockPuzzle} />);
        expect(screen.getByText('難易度:')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('本文')).toBeInTheDocument();
        expect(screen.getByText('パズルの説明')).toBeInTheDocument();
    });
});