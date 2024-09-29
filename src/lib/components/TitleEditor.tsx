'use client';

import { Box, InputBase } from "@mui/material";
import DeviceTypeContext from "@/lib/context/DeviceTypeContext";
import { useContext } from "react";

type TitleEditorProps = {
    title: string;
    setTitle: (title: string) => void;
};

export default function TitleEditor({ title, setTitle }: TitleEditorProps) {
    const deviceType = useContext(DeviceTypeContext);
    return (
        <Box
        sx={{
            paddingY: '0.5rem',
            input: {
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '0.25rem',
            },
        }}
        >
            <h3>タイトル</h3>
            <InputBase placeholder="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} required
            sx={{
                width: deviceType === 'mobile' ? '100%' : '50%',
                fontSize: deviceType === 'mobile' ? '1rem' : '2rem',
            }}/>
        </Box>
    )
}