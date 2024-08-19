import Link from 'next/link';
import Box from '@mui/material/Box';
import { Home, Category, Favorite, Search } from '@mui/icons-material';

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
                    <p>
                    <Search />
                        検索ボックス(モーダル)
                    </p>
            </Box>
        </header>
    );
}