'use client';

import {IconButton, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box} from '@mui/material';
import { Extension, Quiz, AddCircleOutline, AccountCircle, Logout, Login, ArrowRight } from '@mui/icons-material';
import { useState } from 'react';
import Link from 'next/link';
import FirebaseUserContext from '@/lib/context/FirebaseUserContext';
import { useContext } from 'react';
import DeviceTypeContext from '@/lib/context/DeviceTypeContext';

const baseMenu = [
    {title: 'パズル一覧', icon: Extension, href: '/puzzles'},
    {title: 'パズル作成', icon: AddCircleOutline, href: '/puzzles/create'},
    {title: '定石一覧', icon: Quiz, href: '/approaches'},
    {title: '定石作成', icon: AddCircleOutline, href: '/approaches/create'},
];

const authMenu = [
    {title: 'プロフィール', icon: AccountCircle, href: '/profile'},
    {title: 'サインアウト', icon: Logout, href: '/signout'},
];

const guestMenu = [
    {title: 'サインイン', icon: Login, href: '/signin'},
];

export default function LeftDrawer() {
    const [open, setOpen] = useState(false);
    const user = useContext(FirebaseUserContext);

    const menu = baseMenu.concat(user ? authMenu : guestMenu);

    const deviceType = useContext(DeviceTypeContext);

    const handleOpen = () => {
        setOpen(true);
    };

    return (
        <>
        {deviceType === 'desktop' && (
            <>
            <Box onClick={handleOpen} sx={{
                position: 'absolute', 
                top: '50%', 
                left: '0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transform: 'translateY(-50%)',
                cursor: 'pointer', 
                width: '4rem',
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
        )}
        {deviceType === 'mobile' && (
            <>
                <Box onClick={handleOpen} sx={{
                    position: 'absolute',
                    top: '10%',
                    left: '0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '4rem',
                    height: '4rem',
                    backgroundColor: 'lightgray',
                    }}>
                    < ArrowRight sx={{ scale: '2' }} />
                </Box>
                <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
                    <List>
                        {menu.map((item) => (
                            <Link href={item.href} key={item.title}>
                                <ListItem key={item.title}
                                 sx={{ scale: "1.2", ":active": {backgroundColor: "lightgray"}}}>
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
        )}
        </>
    );
}