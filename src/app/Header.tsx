'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import { Home, Category, Favorite } from '@mui/icons-material';
import { useContext } from 'react';
import SearchBox from '@/lib/components/SearchBox';
import FirebaseUserProvider from "@/lib/components/FirebaseUserProvider";
import DeviceTypeContext from '@/lib/context/DeviceTypeContext';

export default function Header() {
    const deviceType = useContext(DeviceTypeContext);
    return (
        <header>
            <p>デバイスの種類: {deviceType}</p>
            <FirebaseUserProvider>
                <Box sx={{ 
                    display: 'flex', 
                    bgcolor: 'primary.main',
                    padding: '1rem', 
                    color: 'white',
                    fontSize: '1.1rem',
                    gap: '1rem',
                    alignItems: 'center',
                    }}>
                        <Link href="/">
                        <Home />
                        ホーム
                        </Link>
                        <Link href="/categories">
                        <Category />
                        カテゴリー一覧
                        </Link>
                        <Link href="/favorites">
                        <Favorite />
                        お気に入り
                        </Link>
                        <SearchBox />
                </Box>
            </FirebaseUserProvider>
        </header>
    );
}