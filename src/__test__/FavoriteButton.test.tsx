import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FavoriteButton from '@/lib/components/FavoriteButton';
import { toggleFavoritePuzzle } from "@/lib/api/puzzleapi";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { User } from 'firebase/auth';

// API関数のモック
jest.mock('@/lib/api/puzzleapi', () => ({
    toggleFavoritePuzzle: jest.fn(),
}));

const mockOnChange = jest.fn();
const mockUser = {
    uid: 'testuid',
} as User;

describe('FavoriteButton', () => {
    test('未ログイン時', async () => {
        const ev = userEvent.setup();
        render(<FirebaseUserContext.Provider value={null}><FavoriteButton initialChecked={false} onChange={mockOnChange} puzzleId="1" /></FirebaseUserContext.Provider>);
        const favoriteButton = screen.getByText('登録');
        await ev.click(favoriteButton);
        expect(toggleFavoritePuzzle).not.toHaveBeenCalled();
        expect(mockOnChange).not.toHaveBeenCalled();
    });
    test('お気に入り登録', async () => {
        const ev = userEvent.setup();
        render(<FirebaseUserContext.Provider value={mockUser}><FavoriteButton initialChecked={false} onChange={mockOnChange} puzzleId="1" /></FirebaseUserContext.Provider>);
        const favoriteButton = screen.getByText('登録');
        await ev.click(favoriteButton);
        await waitFor(() => {
            expect(toggleFavoritePuzzle).toHaveBeenCalledWith('1', 'testuid');
            expect(mockOnChange).toHaveBeenCalledWith(false);
        });
    });
    test('お気に入り解除', async () => {
        const ev = userEvent.setup();
        render(<FirebaseUserContext.Provider value={mockUser}><FavoriteButton initialChecked={true} onChange={mockOnChange} puzzleId="1" /></FirebaseUserContext.Provider>);
        const favoriteButton = screen.getByText('解除');
        await ev.click(favoriteButton);
        await waitFor(() => {
            expect(toggleFavoritePuzzle).toHaveBeenCalledWith('1', 'testuid');
            expect(mockOnChange).toHaveBeenCalledWith(true);
        });
    });
});