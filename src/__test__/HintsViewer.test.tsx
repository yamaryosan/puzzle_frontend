import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import HintsViewer from '@/lib/components/HintsViewer';
import { Hint } from '@prisma/client';
import { fireEvent } from '@testing-library/react';
import getHintsByPuzzleId from '@/lib/api/hintapi';
import FirebaseUserContext from '@/lib/context/FirebaseUserContext';
import { User } from 'firebase/auth';

// モックの設定
jest.mock('@/lib/api/hintapi');
jest.mock('@/lib/components/Viewer');

// モックデータ
const mockHints: Hint[] = [
    {
        id: 1,
        puzzle_id: 1,
        content: 'ヒント本文1',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 2,
        puzzle_id: 1,
        content: 'ヒント本文2',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

const mockUser = {
    uid: '1',
    displayName: 'test user',
    email: 'example@example.com',
} as User;

jest.mock('@/lib/components/Viewer', () => {
    return function Viewer({ defaultValue }: { defaultValue: string }) {
        return <div>{defaultValue}</div>;
    }
});

describe('HintsViewer', () => {
    // モックの設定
    beforeEach(() => {
        jest.clearAllMocks();
        (getHintsByPuzzleId as jest.Mock).mockResolvedValue(mockHints);
    })

    test('未ログイン', async () => {
        render(<HintsViewer puzzleId="1" />);

        await waitFor(async () => {
            expect(getHintsByPuzzleId).not.toHaveBeenCalled();
        });

        expect(screen.getByText('ヒント')).toBeInTheDocument();
        expect(screen.getByText('表示')).toBeInTheDocument();
        expect(screen.queryByText('ヒント1')).not.toBeInTheDocument();
    });

    test('初期状態', async () => {
        await waitFor(async () => {
            render(<HintsViewer puzzleId="1" />);
        });

        expect(screen.getByText('ヒント')).toBeInTheDocument();
        expect(screen.getByText('表示')).toBeInTheDocument();
        expect(screen.queryByText('ヒント1')).not.toBeInTheDocument();
    });

    test('ヒントを表示', async () => {
        await waitFor(async () => {
            render(
                <FirebaseUserContext.Provider value={mockUser}>
                    <HintsViewer puzzleId="1" />
                </FirebaseUserContext.Provider>
            );
        });

        const toggleButton = screen.getByText('表示');
        fireEvent.click(toggleButton);

        await waitFor(async () => {
            expect(getHintsByPuzzleId).toHaveBeenCalled();
        });
    });

    test('ヒントを非表示', async () => {
        await waitFor(async () => {
            render(
                <FirebaseUserContext.Provider value={mockUser}>
                    <HintsViewer puzzleId="1" />
                </FirebaseUserContext.Provider>
            );
        });

        const toggleButton = screen.getByText('表示');
        fireEvent.click(toggleButton);

        await waitFor(() => {
            expect(screen.getByText('非表示')).toBeInTheDocument();
            expect(screen.getByText('ヒント1')).toBeInTheDocument();
        });

        // 非表示にする
        fireEvent.click(screen.getByText('非表示'));

        // 非表示になっていることを確認
        await waitFor(() => {
            expect(screen.getByText('表示')).toBeInTheDocument();
            expect(screen.queryByText('ヒント1')).not.toBeInTheDocument();
        });
    });

    test('タブの切り替え', async () => {
        await waitFor(async () => {
            render(
                <FirebaseUserContext.Provider value={mockUser}>
                    <HintsViewer puzzleId="1" />
                </FirebaseUserContext.Provider>
            );
        });

        const toggleButton = screen.getByText('表示');
        fireEvent.click(toggleButton);

        const tab = screen.getByText('ヒント1');
        fireEvent.click(tab);

        await waitFor(() => {
            expect(screen.getByText('ヒント本文1')).toBeInTheDocument();
            expect(screen.queryByText('ヒント本文2')).not.toBeVisible();
        });

        // タブの切り替え
        const tab2 = screen.getByText('ヒント2');
        fireEvent.click(tab2);

        await waitFor(() => {
            expect(screen.getByText('ヒント本文2')).toBeInTheDocument();
            expect(screen.queryByText('ヒント本文1')).not.toBeVisible();
        });
    });
});
