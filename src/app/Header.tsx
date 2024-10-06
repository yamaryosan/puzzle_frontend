'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import { Home, Category, Favorite } from '@mui/icons-material';
import { useContext } from 'react';
import DesktopSearchBox from '@/lib/components/DesktopSearchBox';
import FirebaseUserProvider from "@/lib/components/FirebaseUserProvider";
import DeviceTypeContext from '@/lib/context/DeviceTypeContext';

export default function Header() {
    const deviceType = useContext(DeviceTypeContext);
    return (
        <header>
            <p>デバイスの種類: {deviceType}</p>
            <FirebaseUserProvider>
                {deviceType==="mobile" && (
                    <Box sx={{ 
                    display: 'flex', 
                    bgcolor: 'primary.main',
                    padding: '1rem', 
                    color: 'white',
                    gap: '1.5rem',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    }}>
                        <Link href="/">
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', scale: '1.5' }}>
                            <Home />
                            <span>ホーム</span>
                        </Box>
                        </Link>
                        <Link href="/categories">
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', scale: '1.5' }}>
                            <Category />
                            <span>カテゴリー</span>
                        </Box>
                        </Link>
                        <Link href="/favorites">
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', scale: '1.5' }}>
                            <Favorite />
                            <span>お気に入り</span>
                        </Box>
                        </Link>
                    </Box>
                )}
                {deviceType==="desktop" && (
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
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Home />
                            <span>ホーム</span>
                        </Box>
                        </Link>
                        <Link href="/categories">
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Category />
                            <span>カテゴリー</span>
                        </Box>
                        </Link>
                        <Link href="/favorites">
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Favorite />
                            <span>お気に入り</span>
                        </Box>
                        </Link>
                        <DesktopSearchBox />
                    </Box>
                )}
            </FirebaseUserProvider>
        </header>
    );
}