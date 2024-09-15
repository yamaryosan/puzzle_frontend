import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import ApproachInfo from '@/lib/components/ApproachInfo';
import { Approach } from '@prisma/client';
import { getPuzzlesByApproachId } from '@/lib/api/approachApi';
import FirebaseUserContext from '@/lib/context/FirebaseUserContext';
import { User } from 'firebase/auth';

// モックデータ
const mockApproach = {
    id: 1,
    title: '定石のタイトル',
    content: '定石の説明',
    user_id: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
} as Approach;

const mockUser = {
    uid: '1',
    displayName: 'test user',
    email: 'example@example.com',
} as User;

// モックの設定
jest.mock('@/lib/api/approachApi', () => {
    return {
        getPuzzlesByApproachId: jest.fn().mockResolvedValue([]),
    };
});

describe('ApproachInfo', () => {

    test('定石の情報を表示', async () => {
        render(<ApproachInfo approach={mockApproach} isActive={false} />);

        const title = screen.getByText('定石のタイトル');
        expect(title).toBeInTheDocument();
    });

    test('編集ボタン非表示', async () => {
        render(<ApproachInfo approach={mockApproach} isActive={false} />);

        const editButton = screen.queryByText('編集');
        expect(editButton).not.toBeInTheDocument();
    });

    test('編集ボタン表示', async () => {
        render(<ApproachInfo approach={mockApproach} isActive={true} />);

        const editButton = screen.getByText('編集');
        expect(editButton).toBeInTheDocument();
    });

    test('定石に紐づくパズルがない場合', async () => {
        render(<ApproachInfo approach={mockApproach} isActive={true} />);

        const message = screen.getByText('この定石に紐づくパズルはありません');
        expect(message).toBeInTheDocument();
    });

    test('定石に紐づくパズルがある場合', async () => {
        render(<ApproachInfo approach={mockApproach} isActive={true} />);
    });

    test('定石に紐づくパズルがある場合', async () => {
        const mockPuzzles = [
            {
                id: 1,
                title: 'パズル1',
                content: 'パズル1の説明',
                user_id: "1",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: 2,
                title: 'パズル2',
                content: 'パズル2の説明',
                user_id: "1",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];
        (getPuzzlesByApproachId as jest.Mock).mockResolvedValue(mockPuzzles);

        await act(async () => {
            render(
                <FirebaseUserContext.Provider value={mockUser}>
                    <ApproachInfo approach={mockApproach} isActive={true} />
                </FirebaseUserContext.Provider>
            )
        });

        expect(screen.getByText('パズル1')).toBeInTheDocument();
        expect(screen.getByText('パズル2')).toBeInTheDocument();
        expect(screen.queryByText('この定石に紐づくパズルはありません')).not.toBeInTheDocument();
    });
});