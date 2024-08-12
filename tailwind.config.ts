import { colors } from "@mui/material";
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary : {
                    main: colors.indigo[500],
                    light: colors.indigo[300],
                    dark: colors.indigo[700],
                },
                secondary: {
                    main: colors.lime[500],
                    light: colors.lime[300],
                    dark: colors.lime[700],
                },
            },
        },
    },
    plugins: [],
};
export default config;
