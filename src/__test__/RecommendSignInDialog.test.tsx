import React, { use } from 'react';
import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import RecommendSignInDialog from '@/lib/components/RecommendSignInDialog';
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { User } from 'firebase/auth';

// モックデータ
const mockUser = {
    uid: '1',
    displayName: 'test user',
    email: 'example@example.com',
} as User;

describe('RecommendSignInDialog', () => {

    test('未ログイン時に表示', async () => {
        render(
            <FirebaseUserContext.Provider value={null}>
                <RecommendSignInDialog />
            </FirebaseUserContext.Provider>
        );
        const signInLink = screen.getByText('サインイン');
        expect(signInLink).toBeInTheDocument();
    });
    test('ログイン時に非表示', async () => {
        render(
            <FirebaseUserContext.Provider value={mockUser}>
                <RecommendSignInDialog />
            </FirebaseUserContext.Provider>
        );
        const signInLink = screen.queryByText('サインイン');
        expect(signInLink).toBeNull();
    });
});