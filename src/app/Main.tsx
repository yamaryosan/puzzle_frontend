import LeftDrawer from "@/app/LeftDrawer";
import { Box } from "@mui/material";

export default function Main({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <>
            <LeftDrawer />
            <Box sx={{ marginX: '2rem', marginTop: '2rem' }}>
                {children}
            </Box>
        </>
    )
}