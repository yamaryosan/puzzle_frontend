import { Box, Card } from "@mui/material";
import useAuth from "@/lib/hooks/useAuth";
import { useState } from "react";
import { Help } from "@mui/icons-material";
import Link from "next/link";

export default function RecommendSignInDialog() {
    const { user, authLoading } = useAuth();
    const [isClosed, setIsClosed] = useState(false);

    if (user || authLoading) {
        return null;
    }

    // ダイアログを閉じる
    const handleClosed = () => {
        setIsClosed(true);
    }

    return (
        <>
        <Box onClick={handleClosed} sx={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1,
            cursor: 'pointer',
            display: isClosed ? 'none' : 'block',
        }} />
        <Card sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            padding: '2rem',
            display: isClosed ? 'none' : 'block',
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Help sx={{ fontSize: '2rem' }} />
                <h2>おしらせ</h2>
            </Box>
            <Link href="/signin">サインイン</Link>
            <span>して、パズルを楽しもう！</span>
        </Card>
        </>
    );
}