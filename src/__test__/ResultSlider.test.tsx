import React, { use } from 'react';
import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import ResultSlider from '@/lib/components/ResultSlider';
import { Puzzle } from '@prisma/client';
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { User } from 'firebase/auth';

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
}

describe('ResultSlider', () => {
    test('未ログイン時は非表示', async () => {
        render(
            <FirebaseUserContext.Provider value={null}>
                <ResultSlider result={mockPuzzles} />
            </FirebaseUserContext.Provider>
        );
        const slider = screen.queryByRole('slider');
        expect(slider).toBeNull();
    });
    test('検索結果がある場合に表示', async () => {
        render(
            <FirebaseUserContext.Provider value={mockUser as User}>
                <ResultSlider result={mockPuzzles} />
            </FirebaseUserContext.Provider>
        );
        const result = screen.getByText('3件の検索結果');
        expect(result).toBeInTheDocument();
    });
    test('検索結果がない場合に非表示', async () => {
        render(
            <FirebaseUserContext.Provider value={mockUser as User}>
                <ResultSlider result={[]} />
            </FirebaseUserContext.Provider>
        );
        const result = screen.queryByText('3件の検索結果');
        expect(result).toBeNull();
    });
});