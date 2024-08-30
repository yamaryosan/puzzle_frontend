import { Box, Typography } from "@mui/material";

type TabPanelProps = {
    children: React.ReactNode;
    value: number;
    index: number;
};

export default function TabPanel({ children, value, index }: TabPanelProps) {
    return (
        <Box role="tabpanel" hidden={value !== index} sx={{ p: 3, width: "100%", height: "400px" }}>
            {children}
        </Box>
    );
};