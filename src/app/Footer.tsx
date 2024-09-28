'use client';

import { Box } from '@mui/material';
import { ContactSupport, Gavel, Info } from '@mui/icons-material';
import Link from 'next/link';
import { useContext } from 'react';
import DeviceTypeContext from '@/lib/context/DeviceTypeContext';

export default function Footer() {
    const deviceType = useContext(DeviceTypeContext);

    return (
        <footer>
            {deviceType === 'desktop' && (
            <Box sx={{ 
                display: 'flex', 
                bgcolor: 'primary.main',
                padding: '1rem', 
                color: 'white',
                fontSize: '1.1rem',
                gap: '1rem',
                alignItems: 'center',
                }}>
                    <Link href="/contact">
                    <ContactSupport />
                    お問い合わせ
                    </Link>
                    <Link href="/terms">
                    <Gavel />
                    利用規約
                    </Link>
                    <Link href="/about">
                    <Info />
                    このサイトについて
                    </Link>
            </Box>
            )}

            {deviceType === 'mobile' && (
            <Box sx={{ 
                display: 'flex', 
                bgcolor: 'primary.main',
                padding: '1rem', 
                color: 'white',
                fontSize: '1.1rem',
                gap: '1rem',
                flexDirection: 'column',
                alignItems: 'center',
                scale: '1.5',
                }}>
                    <Link href="/contact">
                    <ContactSupport />
                    お問い合わせ
                    </Link>
                    <Link href="/terms">
                    <Gavel />
                    利用規約
                    </Link>
                    <Link href="/about">
                    <Info />
                    このサイトについて
                    </Link>
            </Box>
            )}
        </footer>
    );
}