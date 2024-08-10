import Link from 'next/link';
import Box from '@mui/material/Box';

export default function Header() {
    return (
        <header>
            <Box sx={{ 
                display: 'flex', 
                bgcolor: 'primary.main',
                padding: '1rem', 
                color: 'text.secondary',
                fontSize: '1.1rem',
                gap: '1rem',
                }}>
                <Link href="/">ホーム</Link>
                <Link href="/categories">カテゴリー一覧</Link>
                <Link href="/approaches">定石一覧</Link>
                <Link href="/favorites">お気に入り</Link>
            <p>検索ボックス(モーダル)</p>
            </Box>
        </header>
    );
}