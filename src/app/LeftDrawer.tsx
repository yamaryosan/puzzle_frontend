'use client';

import {Button, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText} from '@mui/material';
import { Extension, Quiz, AddCircleOutline, AccountCircle, Logout } from '@mui/icons-material';
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
            <Button onClick={handleOpen}>Open</Button>
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