'use client';

import { indigo, lime } from '@mui/material/colors';
import { createTheme, ThemeOptions } from '@mui/material/styles';

const lightTheme: ThemeOptions = {
    palette: {
        mode: 'light',
        primary: {
            main: indigo[500],
            light: indigo[300],
            dark: indigo[700],
        },
        secondary: {
            main: lime[500],
            light: lime[300],
            dark: lime[700],
        },
        text: {
            primary: '#000000',
            secondary: '#ffffff',
            disabled: '#999999',
        },
    },
};

const darkTheme: ThemeOptions = {
    palette: {
        mode: 'dark',
        primary: {
            main: '#4a69dd',
        },
        secondary: {
            main: '#ff4081',
        },
        background: {
            default: '#121212',
            paper: '#1e1e1e',
        },
        text: {
            primary: '#ffffff',
            secondary: '#b0b0b0',
            disabled: '#6c6c6c',
        },
    },
    typography: {
        h1: {
            color: '#4a69dd',
        },
        body1: {
            color: '#ffffff',
        },
    },
};

const theme = createTheme(lightTheme); // デフォルトはライトモード

export { lightTheme, darkTheme };
export default theme;