import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import firebaseApp from '@/app/firebase';

type Auth = {
    user: User | null;
    authLoading: boolean;
};

/**
 * ユーザーの認証情報を取得するカスタムフック
 * @returns ユーザーの認証情報
 */
export default function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setAuthLoading(false);
        });
        return () => unsubscribe();
  }, []);

  return { user, authLoading } as Auth;
}