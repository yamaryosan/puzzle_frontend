import { useState, useEffect } from "react";
import Quill from "quill";

import DeltaClass from 'quill-delta';
import { Box, Tabs, Tab } from "@mui/material";
import HintTabPanel from "@/lib/components/HintTabPanel";
import Viewer from "@/lib/components/Viewer";
import getHintsByPuzzleId from "@/lib/api/hintapi";
import { Hint } from "@prisma/client";

type HintsViewerProps = {
    puzzleId: string;
};

const maxHints = 3;

/**
 * 複数ヒントのビューワー
 * @returns 
 */
export default function HintsViewer({ puzzleId }: HintsViewerProps) {
    const [hints, setHints] = useState<Hint[] | null>(null);
    const [value, setValue] = useState(0);

    // ヒントを取得
    useEffect(() => {
        async function fetchHints() {
            const hints = await getHintsByPuzzleId(puzzleId);
            setHints(hints || []);
        }
        fetchHints();
    }, []);

    // タブの変更
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <h3>ヒント</h3>
        <Tabs
            orientation="horizontal"
            variant="scrollable"
            value={value}
            onChange={handleChange}
            sx={{
            // タブのスタイル
            '& .MuiTab-root': {
                flex: 1, // タブの幅を均等にする
                maxWidth: 'none',
                color: 'grey.300',
                fontSize: '1.2rem',
                // 非選択時の下線
                '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '4px',
                backgroundColor: 'grey.300',
                transition: 'background-color 0.3s',
                },
            },
            // タブ選択時のスタイル
            '& .Mui-selected': {
                color: 'primary.main',
                fontWeight: 'bold',
                backgroundColor: 'grey.200',
                // 選択時の下線
                '&::before': { backgroundColor: 'primary.main' },
            },
            }}>
                {hints?.map((hint, index) => (
                    <Tab label={`ヒント${index + 1}`} key={index} />
                ))}
            </Tabs>
            {hints?.map((hint, index) => (
                <HintTabPanel value={value} index={index} key={index} >
                    {hint.content}
                </HintTabPanel>
            ))}
        </Box>
        </>
    )
}