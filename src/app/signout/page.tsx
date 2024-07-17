'use client';

import Link from 'next/link';
import { getAuth, signOut } from 'firebase/auth';
import firebaseApp from '@/app/firebase';
import { useEffect } from 'react';

export default function App() {
    const auth = getAuth(firebaseApp);

    // サインアウト
    useEffect(() => {
        signOut(auth);
    }, []);

    return (
        <div>
            <p>サインアウトしました。</p>
            <Link href="/signin">サインイン</Link>
        </div>
    );
}