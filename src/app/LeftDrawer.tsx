'use client';

import {IconButton, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box} from '@mui/material';
import { Extension, Quiz, AddCircleOutline, AccountCircle, Logout, ArrowLeft, ArrowRight } from '@mui/icons-material';
import AddPuzzleIcon from '@/lib/icons/AddPuzzleIcon';
import { useState } from 'react';

const menu = [
    {title: 'パズル一覧', icon: Extension},
    {title: 'パズル作成', icon: AddCircleOutline},
    {title: '定石一覧', icon: Quiz},
    {title: '定石作成', icon: AddCircleOutline},
    {title: 'プロフィール', icon: AccountCircle},
    {title: 'ログアウト', icon: Logout},
];

export default function LeftDrawer() {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    }

    return (
        <>
            <Box onClick={handleOpen} sx={{
                position: 'fixed', 
                top: '50%', 
                left: '0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transform: 'translateY(-50%)',
                cursor: 'pointer', 
                width: '4rem', 
                height: '80%'
                }} >
                < ArrowRight />
            </Box>
            <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
                <List>
                    {menu.map((item) => (
                        <ListItem key={item.title}>
                            <ListItemButton>
                                <ListItemIcon>
                                    <item.icon />
                                </ListItemIcon>
                                <ListItemText primary={item.title} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </>
    );
}