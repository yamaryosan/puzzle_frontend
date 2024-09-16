import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import ApproachesViewer from '@/lib/components/ApproachesViewer';
import { Approach } from '@prisma/client';
import { fireEvent } from '@testing-library/react';
import * as approachApi from '@/lib/api/approachApi';
import FirebaseUserContext from '@/lib/context/FirebaseUserContext';
import { User } from 'firebase/auth';

// モックの設定
jest.mock('@/lib/api/approachApi');
jest.mock('@/lib/components/Viewer');

// モックデータ
const mockApproaches: Approach[] = [
    {
        id: 1,
        title: '定石のタイトル1',
        content: '定石の説明1',
        user_id: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: 2,
        title: '定石のタイトル2',
        content: '定石の説明2',
        user_id: "1",
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

describe('ApproachesViewer', () => {
    // モックの設定
    beforeEach(() => {
        jest.clearAllMocks();
        (approachApi.getApproachesByPuzzleId as jest.Mock).mockResolvedValue(mockApproaches);
    });

    test('未ログイン', async () => {
        render(<ApproachesViewer puzzleId="1" />);

        await waitFor(async () => {
            expect(approachApi.getApproachesByPuzzleId).not.toHaveBeenCalled();
        });

        expect(screen.getByText('定石')).toBeInTheDocument();
        expect(screen.getByText('表示')).toBeInTheDocument();
        expect(screen.queryByText('定石1 定石のタイトル1')).not.toBeInTheDocument();
    });

    test('初期状態', async () => {
        await waitFor(async () => {
            render(
                <FirebaseUserContext.Provider value={mockUser}>
                    <ApproachesViewer puzzleId="1" />
                </FirebaseUserContext.Provider>
            );
        });

        expect(screen.getByText('定石')).toBeInTheDocument();
        expect(screen.getByText('表示')).toBeInTheDocument();
        expect(screen.queryByText('定石1 定石のタイトル1')).not.toBeInTheDocument();
    });

    test('定石を表示', async () => {
        await waitFor(async () => {
            render(
                <FirebaseUserContext.Provider value={mockUser}>
                    <ApproachesViewer puzzleId="1" />
                </FirebaseUserContext.Provider>
            );
        });

        await waitFor(async () => {
            expect(approachApi.getApproachesByPuzzleId).toHaveBeenCalledWith('1');
        });

        const toggleButton = screen.getByText('表示');
        fireEvent.click(toggleButton);

        await waitFor(() => {
            expect(screen.getByText('非表示')).toBeInTheDocument();
            expect(screen.getByText('定石1 定石のタイトル1')).toBeInTheDocument();
            expect(screen.getByText('定石2 定石のタイトル2')).toBeInTheDocument();
        });
    });

    test('定石を非表示', async () => {
        await waitFor(async () => {
            render(
                <FirebaseUserContext.Provider value={mockUser}>
                    <ApproachesViewer puzzleId="1" />
                </FirebaseUserContext.Provider>
            );
        });

        const toggleButton = screen.getByText('表示');
        fireEvent.click(toggleButton);

        await waitFor(() => {
            expect(screen.getByText('非表示')).toBeInTheDocument();
            expect(screen.getByText('定石1 定石のタイトル1')).toBeInTheDocument();
            expect(screen.getByText('定石2 定石のタイトル2')).toBeInTheDocument();
        });

        // 非表示にする
        fireEvent.click(screen.getByText('非表示'));

        // 非表示になっていることを確認
        await waitFor(() => {
            expect(screen.getByText('表示')).toBeInTheDocument();
            expect(screen.queryByText('定石1 定石のタイトル1')).not.toBeInTheDocument();
            expect(screen.queryByText('定石2 定石のタイトル2')).not.toBeInTheDocument();
        });
    });

    test('タブの切り替え', async () => {
        await waitFor(async () => {
            render(
                <FirebaseUserContext.Provider value={mockUser}>
                    <ApproachesViewer puzzleId="1" />
                </FirebaseUserContext.Provider>
            );
        });

        await waitFor(async () => {
            expect(approachApi.getApproachesByPuzzleId).toHaveBeenCalledWith('1');
        });

        const toggleButton = screen.getByText('表示');
        fireEvent.click(toggleButton);

        await waitFor(() => {
            expect(screen.getByText('非表示')).toBeInTheDocument();
            expect(screen.getByText('定石1 定石のタイトル1')).toBeInTheDocument();
            expect(screen.getByText('定石の説明2')).toBeInTheDocument();
        });

        const tab = screen.getByText('定石1 定石のタイトル1');
        fireEvent.click(tab);

        await waitFor(() => {
            expect(screen.getByText('定石の説明1')).toBeInTheDocument();
            expect(screen.queryByText('定石の説明2')).not.toBeVisible();
        });

        // タブの切り替え
        const tab2 = screen.getByText('定石2 定石のタイトル2');
        fireEvent.click(tab2);

        await waitFor(() => {
            expect(screen.getByText('定石の説明2')).toBeInTheDocument();
            expect(screen.queryByText('定石の説明1')).not.toBeVisible();
        });
    });
});
