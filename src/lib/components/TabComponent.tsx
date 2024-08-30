import { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import TabPanel from "@/lib/components/TabPanel";

export default function TabComponent() {
    const [value, setValue] = useState(0);

    // タブの変更
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <>
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
                {Array.from({ length: 3 }, (_, i) => (
                    <Tab sx={{ height: 100 }} key={i} label={`タブ${i + 1}`} />
                ))}
            </Tabs>
            {Array.from({ length: 3 }, (_, i) => (
                <TabPanel key={i} value={value} index={i}>
                    {`タブ${i + 1}の内容`}
                </TabPanel>
            ))}
        </Box>
        </>
    )
}