import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/app/Header";
import Footer from "@/app/Footer";
import Main from "@/app/Main";
import theme from "@/theme";
import { ThemeProvider, CssBaseline } from "@mui/material";
import DeviceTypeProvider from "@/lib/components/DeviceTypeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "ぱずリング",
    description: "ぱずリングは自作パズルを保管するためのサービスです",
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="ja">
            <body className={inter.className}>
                <DeviceTypeProvider>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        <Header />
                        <Main>{children}</Main>
                        <Footer />
                    </ThemeProvider>
                </DeviceTypeProvider>
            </body>
        </html>
    );
}
