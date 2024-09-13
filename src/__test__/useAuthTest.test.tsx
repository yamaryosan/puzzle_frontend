import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { onAuthStateChanged, User } from 'firebase/auth';
import useAuth from '@/lib/hooks/useAuth';

// Firebase Authのモック
jest.mock('firebase/auth');

// テスト用のコンポーネント
function TestComponent (){
    const { user, authLoading, userId } = useAuth();
    return (
        <div>
            <p data-testid="userEmail">{user?.email}</p>
            <p data-testid="authLoading">{authLoading ? 'true': 'false'}</p>
            <p data-testid="userId">{userId}</p>
        </div>
    );
};

describe('useAuth', () => {
    let authStateChanged = ((user: User | null) => {});

    // モックの設定
    beforeEach(() => {
        (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
            authStateChanged = callback;
            return jest.fn();
        });
    });

    it('初期状態でauthLoadingがtrueであること', async () => {
        const { getByTestId } = render(<TestComponent />);

        expect(getByTestId('authLoading').textContent).toBe('true');
        expect(getByTestId('userEmail').textContent).toBe('');
        expect(getByTestId('userId').textContent).toBe('');
    });

    it('未認証状態', async () => {
        const { getByTestId } = render(<TestComponent />);

        // 未認証状態をシミュレート
        await act(async () => {
            authStateChanged(null);
        });

        await waitFor(() => {
            expect(getByTestId('authLoading').textContent).toBe('false');
            expect(getByTestId('userEmail').textContent).toBe('');
            expect(getByTestId('userId').textContent).toBe('');
        });
    });

    it('認証状態', async () => {
        const { getByTestId } = render(<TestComponent />);
        const mockUser = { email: 'example@example.com', uid: '123'} as User;
        
        // 認証状態をシミュレート
        await act(async () => {
            authStateChanged(mockUser);
        });

        await waitFor(() => {
            expect(getByTestId('authLoading').textContent).toBe('false');
            expect(getByTestId('userEmail').textContent).toBe(mockUser.email);
            expect(getByTestId('userId').textContent).toBe(mockUser.uid);
        });
    });

    it('認証状態から未認証状態', async () => {
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