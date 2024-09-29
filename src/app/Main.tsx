import LeftDrawer from "@/app/LeftDrawer";
import { Box } from "@mui/material";
import FirebaseUserProvider from "@/lib/components/FirebaseUserProvider";
import AuthGuardLayout from "@/lib/components/AuthGuardLayout";
import SearchDrawer from "@/app/SearchDrawer";

export default function Main({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <>
        <FirebaseUserProvider>
            <Box sx={{ minHeight: '600px', position: 'relative' }}>
                <LeftDrawer />
                <SearchDrawer />
                <Box sx={{ paddingX: '4rem', paddingTop: '2rem', fontSize: '1.2rem' }}>
                    <AuthGuardLayout>
                        {children}
                    </AuthGuardLayout>
                </Box>
            </Box>
        </FirebaseUserProvider>
        </>
    )
}