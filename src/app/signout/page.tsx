'use client';

import Link from 'next/link';
import { getAuth, signOut } from 'firebase/auth';
import firebaseApp from '@/app/firebase';
import { useEffect } from 'react';
import CommonButton from '@/lib/components/common/CommonButton';
import { Login } from '@mui/icons-material';

export default function App() {
    const auth = getAuth(firebaseApp);

    // サインアウト
    useEffect(() => {
        signOut(auth);
    }, [auth]);

    return (
        <div>
            <p>サインアウトしました。</p>
            <Link href="/signin">
            <CommonButton color="secondary" onClick={() => {}}>
                <Login />
                サインイン画面に戻る
            </CommonButton>
            </Link>
        </div>
    );
}