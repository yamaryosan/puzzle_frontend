import Link from 'next/link';
import Box from '@mui/material/Box';

export default function Header() {
    return (
        <header>
            <Box sx={{ display: 'flex', bgcolor: 'primary.main', padding: '1rem', color: 'text.secondary' }}>
                <Link href="/">ホーム</Link>
                <Link href="/dashboard">ダッシュボード</Link>
                <Link href="/categories">カテゴリー一覧</Link>
                <Link href="/approaches">定石一覧</Link>
                <Link href="/favorites">お気に入り</Link>
            <p>検索ボックス(モーダル)</p>
            </Box>
        </header>
    );
}