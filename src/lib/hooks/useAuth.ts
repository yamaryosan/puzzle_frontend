import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import firebaseApp from '@/app/firebase';

type UserAuth = {
    user: User | null;
    authLoading: boolean;
    uId?: string | undefined;
};

/**
 * ユーザーの認証情報を取得するカスタムフック
 * @returns user: ユーザー情報, authLoading: ローディング状態
 */
export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [uId, setUId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
        if (user) {
            setUId(user.uid);
        }
    });
    return () => unsubscribe();
  }, []);

  return { user, authLoading, uId } as UserAuth;
}