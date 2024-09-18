import LeftDrawer from "@/app/LeftDrawer";
import { Box } from "@mui/material";
import FirebaseUserProvider from "@/lib/components/FirebaseUserProvider";

export default function Main({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <>
        <FirebaseUserProvider>
            <Box sx={{ minHeight: '600px', position: 'relative' }}>
                <LeftDrawer />
                <Box sx={{ paddingX: '4rem', paddingTop: '2rem' }}>
                    {children}
                </Box>
            </Box>
        </FirebaseUserProvider>
        </>
    )
}