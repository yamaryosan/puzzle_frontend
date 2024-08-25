import LeftDrawer from "@/app/LeftDrawer";
import { Box } from "@mui/material";

export default function Main({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <>
        <Box sx={{ minHeight: '600px', position: 'relative' }}>
            <LeftDrawer />
            <Box sx={{ paddingX: '4rem', paddingTop: '2rem' }}>
                {children}
            </Box>
        </Box>
        </>
    )
}