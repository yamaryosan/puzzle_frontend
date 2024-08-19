'use client';

import Link from 'next/link';
import { getApproaches } from '@/lib/api/approachApi';
import { useEffect, useState } from 'react';
import { Approach } from '@prisma/client';
import ApproachCard from '@/lib/components/ApproachCard';
import { Box, Button } from '@mui/material';
import { AddCircleOutline, QuizOutlined } from '@mui/icons-material';

export default function Page() {
    const [approaches, setApproaches] = useState<Approach[]>([]);
    // アクティブなカードのID
    const [activeCardId, setActiveCardId] = useState<number | null>(null);

    useEffect(() => {
        getApproaches().then(approaches => {
            if (!approaches) {
                return;
            }
            setApproaches(approaches);
        });
    }, []);

    // カードのクリックイベント
    const handleCardClick = (id: number) => {
        setActiveCardId(id === activeCardId ? null : id);
    };

    return (
        <>
        <h2>
            <QuizOutlined />
            定石一覧
    </h2>
        {approaches.length === 0 ? <div>定石がありません</div> : null}
        <ul>
            {approaches.map(approach => (
                <ApproachCard key={approach.id} approach={approach} isActive={approach.id === activeCardId} onClick={() => handleCardClick(approach.id)} />
            ))}
        </ul>
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
            <Button sx={{
                marginX: "0.5rem",
                scale: "1.4",
                color: "white",
                }}>
                <AddCircleOutline />
                <span>定石作成</span>
            </Button>
        </Box>
        </Link>
        </>
    );
}