import { Box } from '@mui/material';
import { ContactSupport, Gavel, Info } from '@mui/icons-material';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer>
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
        </footer>
    );
}