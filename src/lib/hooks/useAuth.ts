import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import firebaseApp from '@/app/firebase';

/**
 * ユーザーの認証情報を取得するカスタムフック
 * @returns ユーザーの認証情報
 */
export default function useAuth() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const auth = getAuth(firebaseApp);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
  }, []);

  return user as User | null;
}