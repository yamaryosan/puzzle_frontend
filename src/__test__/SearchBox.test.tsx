import React, { use } from 'react';
import '@testing-library/jest-dom';
import { render, screen, act, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { Puzzle } from '@prisma/client';
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { User } from 'firebase/auth';
import SearchBox from '@/lib/components/SearchBox';
import { searchPuzzles } from '@/lib/api/puzzleapi';

// モックデータ
const mockPuzzles = [
    {
        id: 1,
        title: 'パズル1',
        description: 'パズル1の説明',
        is_solved: false,
        is_favorite: false,
        user_id: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 2,
        title: 'パズル2',
        description: 'パズル2の説明',
        is_solved: false,
        is_favorite: false,
        user_id: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 3,
        title: 'パズル3',
        description: 'パズル3の説明',
        is_solved: false,
        is_favorite: false,
        user_id: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
] as Puzzle[];

const mockUser = {
    uid: '1',
    email: 'example@example.com',
} as User;

// 関数のモック
jest.mock('@/lib/api/puzzleapi', () => {
    return {
        searchPuzzles: jest.fn().mockResolvedValue([]),
    };
});

// ResultSliderのモック
jest.mock('@/lib/components/ResultSlider', () => {
    return function ResultSlider({ result }: { result: Puzzle[] }) {
        return (
            <div>
                {result.length === 0 ? <div>0件の検索結果</div> : <div>{result.length}件の検索結果</div>}
                {result.map((puzzle) => (
                    <div key={puzzle.id}>{puzzle.title}</div>
                ))}
            </div>
        );
    }
});

describe('SearchBox', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('未ログイン時はdisabled', async () => {
        render(
            <FirebaseUserContext.Provider value={null}>
                <SearchBox />
            </FirebaseUserContext.Provider>
        );
        const input = screen.getByRole('textbox');
        expect(input).toBeDisabled();
    });

    test('ログイン時はenabled', async () => {
        render(
            <FirebaseUserContext.Provider value={mockUser}>
                <SearchBox />
            </FirebaseUserContext.Provider>
        );
        const input = screen.getByRole('textbox');
        expect(input).toBeEnabled();
    });

    test('検索キーワードを入力', async () => {
        render(
            <FirebaseUserContext.Provider value={mockUser}>
                <SearchBox />
            </FirebaseUserContext.Provider>
        );
        const ev = userEvent.setup();
        const input = screen.getByRole('textbox');
        await ev.click(input);
        await ev.type(input, 'パズル');
        expect(input).toHaveFocus();
        expect(input).toHaveValue('パズル');
    });

    test('検索結果がない場合に表示', async () => {
        (searchPuzzles as jest.Mock).mockResolvedValue([]);
        render(
            <FirebaseUserContext.Provider value={mockUser}>
                <SearchBox />
            </FirebaseUserContext.Provider>
        );
        const ev = userEvent.setup();
        const input = screen.getByRole('textbox');
        await ev.click(input);
        await ev.type(input, 'パズル');
        // 検索結果が表示される
        await waitFor(() => {
            const result = screen.getByText('0件の検索結果');
            expect(result).toBeInTheDocument();
        });
    });

    test('検索結果がある場合に表示', async () => {
        (searchPuzzles as jest.Mock).mockResolvedValue(mockPuzzles);

        render(
            <FirebaseUserContext.Provider value={mockUser}>
                <SearchBox />
            </FirebaseUserContext.Provider>
        );

        const input = screen.getByRole('textbox');
        const ev = userEvent.setup();
        await ev.click(input);
        await ev.type(input, 'パズル');
        // 検索結果を取得
        await waitFor(() => {
            expect(screen.getByText('3件の検索結果')).toBeInTheDocument();
            expect(screen.getByText('パズル1')).toBeInTheDocument();
            expect(screen.getByText('パズル2')).toBeInTheDocument();
            expect(screen.getByText('パズル3')).toBeInTheDocument();
            expect(screen.queryByText('0件の検索結果')).not.toBeInTheDocument();
        });
    });
});