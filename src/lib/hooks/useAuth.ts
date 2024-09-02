import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import firebaseApp from '@/app/firebase';

type UserAuth = {
    user: User | null;
    authLoading?: boolean;
    userId?: string | undefined;
};

/**
 * ユーザーの認証情報を取得するカスタムフック
 * @returns user: ユーザー情報, authLoading: ローディング状態
 */
export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
        if (user) {
            setUserId(user.uid);
        }
    });
    return () => unsubscribe();
  }, []);

  return { user, authLoading, userId } as UserAuth;
}