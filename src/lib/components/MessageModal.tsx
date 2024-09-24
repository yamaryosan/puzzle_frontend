'use client';

import { useState, useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import { ThumbUpAltOutlined } from '@mui/icons-material';
import { useTransition, animated } from 'react-spring';
import { config } from 'react-spring';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

type MessageModalProps = {
    message: string;
    param: string;
};

export default function MessageModal({ message, param }: MessageModalProps) {
    const [isVisible, setIsVisible] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const removeParam = () => {
            const current = new URLSearchParams(searchParams);
            current.delete(param);
    
            const newParam = current.toString();
            router.push(`${window.location.pathname}?${newParam}`);
        };
        const timer = setTimeout(() => {
            setIsVisible(false);
            removeParam();
        }, 3000);
        return () => {
            clearTimeout(timer);
        };
    }, [param, router, searchParams]);

    const transitions = useTransition(isVisible, {
        from: { opacity: 0, transform: "translateY(-200%)" },
        enter: { opacity: 1, transform: "translateY(0%)" },
        leave: { opacity: 0, transform: "translateY(-400%)" },
        config: config.stiff,
    });

    return (
        transitions((style, item) => item &&
            <animated.div style={{...style, position: "fixed", top: "1rem", right: "1rem", zIndex: 10 }}>
                <Paper sx={{ backgroundColor: "white", padding: "1rem", borderRadius: "0.5rem", width: "auto", boxShadow: "0 0 0.5rem rgba(0, 0, 0, 0.2)" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <ThumbUpAltOutlined sx={{ marginRight: "0.5rem" }} />
                        {message}
                    </Box>
                </Paper>
            </animated.div>
        )
    );
}