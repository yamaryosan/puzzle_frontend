import { useState, useEffect } from "react";
import { Box, Tabs, Tab, Button } from "@mui/material";
import TabPanel from "@/lib/components/TabPanel";
import Viewer from "@/lib/components/Viewer";
import { getApproachesByPuzzleId } from "@/lib/api/approachApi";
import { Approach } from "@prisma/client";

type ApproachesViewerProps = {
    puzzleId: string;
};

/**
 * 定石のビューワー
 * @returns 
 */
export default function ApproachesViewer({ puzzleId }: ApproachesViewerProps) {
    const [show, setShow] = useState(false);
    const [approaches, setApproaches] = useState<Approach[] | null>(null);
    const [value, setValue] = useState(0);

    // 定石を取得
    useEffect(() => {
        async function fetchapproaches() {
            const approaches = await getApproachesByPuzzleId(puzzleId) as Approach[];
            setApproaches(approaches);
        }
        fetchapproaches();
    }, []);

    // タブの変更
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    // 表示・非表示の切り替え
    const handleToggle = () => {
        setShow(!show);
    };

    return (
        <>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <h3>定石</h3>
            <Button onClick={handleToggle} sx={{ marginLeft: '1rem' }}>{show ? '非表示' : '表示'}</Button>
        </Box>
        {show &&
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
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
                    {approaches?.map((approach, index) => (
                        <Tab label={`定石${index + 1} ${approach.title}`} key={index} />
                    ))}
            </Tabs>
            {approaches?.map((approach, index) => (
                <TabPanel value={value} index={index} key={index} >
                    <Viewer defaultValue={approach.content} />
                </TabPanel>
            ))}
        </Box>
        }
        </>
    )
}