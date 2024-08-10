'use client';

import {Button, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText} from '@mui/material';
import { useState } from 'react';

const menu = [
    {text: 'Home', icon: 'home'},
    {text: 'About', icon: 'info'},
    {text: 'Contact', icon: 'mail'},
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
                        <ListItem key={item.text}>
                            <ListItemButton>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </>
    );
}