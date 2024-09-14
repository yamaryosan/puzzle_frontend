'use client';

import React, { useEffect, useState } from 'react';
import { FirebaseUserContext } from '@/lib/context/FirebaseUserContext';
import { User } from 'firebase/auth';
import useAuth from '@/lib/hooks/useAuth';

export default function FirebaseUserProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const { user, authLoading } = useAuth();
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

    useEffect(() => {
        if (authLoading) return;
        setFirebaseUser(user);
    }, [authLoading, user]);

    return (
        <FirebaseUserContext.Provider value={user}>
            {children}
        </FirebaseUserContext.Provider>
    );
}