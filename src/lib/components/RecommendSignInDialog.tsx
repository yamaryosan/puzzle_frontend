import { Box, Button, Card } from "@mui/material";
import { useState } from "react";
import { ErrorOutline, CancelOutlined } from "@mui/icons-material";
import Link from "next/link";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { useContext } from "react";

export default function RecommendSignInDialog() {
    const user = useContext(FirebaseUserContext);
    const [isClosed, setIsClosed] = useState(false);

    if (user) {
        return null;
    }

    return (
        <>
        <Box onClick={() => setIsClosed(true)} sx={{
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
            padding: '1rem',
            width: '40%',
            display: isClosed ? 'none' : 'block',
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ErrorOutline sx={{ fontSize: '1.5rem' }} />
                <h3>お知らせ</h3>
                <Button variant="outlined" sx={{ marginLeft: 'auto', color: "error.main" }} onClick={() => setIsClosed(true)}>
                    <CancelOutlined />
                </Button>
            </Box>
            <p>ユーザ登録して、パズルを楽しもう！</p>
            <Button variant="contained" color="primary" sx={{ marginTop: '1rem', width: '100%' }}>
                <Link href="/signup">登録</Link>
            </Button>
            <Box sx={{ height: '1rem' }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <p>アカウントをお持ちの方は
                    <Box component="span" sx={{ color: 'primary.main', cursor: 'pointer' }}>
                        <Link href="/signin">こちら</Link>
                    </Box>
                </p>
            </Box>
        </Card>
        </>
    );
}