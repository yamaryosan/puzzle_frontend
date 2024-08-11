'use client';

import {IconButton, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box} from '@mui/material';
import { Extension, Quiz, AddCircleOutline, AccountCircle, Logout, ArrowLeft, ArrowRight } from '@mui/icons-material';
import AddPuzzleIcon from '@/lib/icons/AddPuzzleIcon';
import { useState } from 'react';
import Link from 'next/link';

const menu = [
    {title: 'パズル一覧', icon: Extension, href: '/puzzles'},
    {title: 'パズル作成', icon: AddCircleOutline, href: '/puzzles/create'},
    {title: '定石一覧', icon: Quiz, href: '/approaches'},
    {title: '定石作成', icon: AddCircleOutline, href: '/approaches/create'},
    {title: 'プロフィール', icon: AccountCircle, href: '/profile'},
    {title: 'ログアウト', icon: Logout, href: '/logout'},
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
                width: '2rem', 
                height: '100%'
                }} >
                < ArrowRight />
            </Box>
            <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
                <List>
                    {menu.map((item) => (
                        <Link href={item.href} key={item.title}>
                            <ListItem key={item.title}>
                                <ListItemButton onClick={() => setOpen(false)}>
                                    <ListItemIcon>
                                        <IconButton>
                                            <item.icon />
                                        </IconButton>
                                    </ListItemIcon>
                                    <ListItemText primary={item.title} />
                                </ListItemButton>
                            </ListItem>
                        </Link>
                    ))}
                </List>
            </Drawer>
        </>
    );
}