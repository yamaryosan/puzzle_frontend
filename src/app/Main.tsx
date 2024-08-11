import LeftDrawer from "@/app/LeftDrawer";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";

export default function Main({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <>
            <LeftDrawer />
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <Box sx={{ marginX: '2rem', marginTop: '2rem', width: '70%' }}>
                    {children}
                </Box>
                <Box sx={{ marginX: '1rem', marginTop: '2rem', width: '30%' }}>
                    <Sidebar />
                </Box>
            </Box>
        </>
    )
}