'use client';

import Link from 'next/link';
import { getApproaches } from '@/lib/api/approachApi';
import { useEffect, useState } from 'react';
import { Approach } from '@prisma/client';
import ApproachCard from '@/lib/components/ApproachCard';
import { Box, Button } from '@mui/material';
import { AddCircleOutline, QuizOutlined } from '@mui/icons-material';
import useAuth from '@/lib/hooks/useAuth';
import RecommendSignInDialog from '@/lib/components/RecommendSignInDialog';

export default function Page() {
    const { user, userId } = useAuth();
    const [approaches, setApproaches] = useState<Approach[]>([]);
    // アクティブなカードのID
    const [activeCardId, setActiveCardId] = useState<number | null>(null);

    useEffect(() => {
        async function fetchApproaches() {
            if (!userId) return;
            const approaches = await getApproaches(userId ?? '');
            setApproaches(approaches || []);
        }
        fetchApproaches();
    }, [userId]);

    // カードのクリックイベント
    const handleCardClick = (id: number) => {
        setActiveCardId(id === activeCardId ? null : id);
    };

    return (
        <>
        {user ? (
        <>
        <h2>
            <QuizOutlined />
            定石一覧
        </h2>
        <Link href="/approaches/create" style={{display: "block"}}>
        <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingY: "1rem",
            backgroundColor: "primary.light",
            cursor: "pointer",
            ":hover": {
                backgroundColor: "primary.main",
                transition: "background-color 0.3s",
            },
        }}>
            <Button sx={{ marginX: "0.5rem", scale: "1.4", color: "white" }}>
                <AddCircleOutline />
                <span>定石作成</span>
            </Button>
        </Box>
        </Link>

        <ul>
            {approaches.map(approach => (
                <ApproachCard key={approach.id} approach={approach} isActive={approach.id === activeCardId} onClick={() => handleCardClick(approach.id)} />
            ))}
        </ul>
        {approaches.length === 0 && <p>最初の定石を作成しましょう！</p>}
        </>
        ) : (
        <div>
            <RecommendSignInDialog />
        </div>
        )}
        </>
    );
}