import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { onAuthStateChanged, User } from 'firebase/auth';
import useAuth from '@/lib/hooks/useAuth';

const mockUser = { email: 'example@example.com', uid: '123'} as User;

// Firebase Authのモック
jest.mock('firebase/auth');

// テスト用のコンポーネント
function TestComponent (){
    const user = useAuth();
    return (
        <div>
            <p data-testid="userEmail">{user?.email}</p>
            <p data-testid="userId">{user?.uid}</p>
        </div>
    );
};

describe('useAuth', () => {
    const mockOnAuthStateChanged = onAuthStateChanged as jest.Mock;
    let authStateChanged = ((user: User | null) => {});

    // モックの設定
    beforeEach(() => {
        mockOnAuthStateChanged.mockImplementation((auth, callback) => {
            authStateChanged = callback;
            return jest.fn();
        })
    });

    test('初期状態', async () => {
        const { getByTestId } = render(<TestComponent />);

        expect(getByTestId('userEmail').textContent).toBe('');
        expect(getByTestId('userId').textContent).toBe('');
    });

    test('未認証状態', async () => {
        const { getByTestId } = render(<TestComponent />);

        // 未認証状態をシミュレート
        await act(async () => {
            authStateChanged(null);
        });

        await waitFor(() => {
            expect(getByTestId('userEmail').textContent).toBe('');
            expect(getByTestId('userId').textContent).toBe('');
        });
    });

    test('認証状態', async () => {
        const { getByTestId } = render(<TestComponent />);

        // 認証状態をシミュレート
        await act(async () => {
            authStateChanged(mockUser);
        });

        await waitFor(() => {
            expect(getByTestId('userEmail').textContent).toBe(mockUser.email);
            expect(getByTestId('userId').textContent).toBe(mockUser.uid);
        });
    });

    test('認証状態から未認証状態', async () => {
        const unsubscribe = jest.fn();
        (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
            authStateChanged = callback;
            return unsubscribe;
        });

        const { unmount } = render(<TestComponent />);
        unmount();

        expect(unsubscribe).toHaveBeenCalled();
    });
});