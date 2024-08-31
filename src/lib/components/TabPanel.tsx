import { Box } from "@mui/material";

type TabPanelProps = {
    children: React.ReactNode;
    value: number;
    index: number;
};

export default function TabPanel({ children, value, index }: TabPanelProps) {
    return (
        <div
        role="tabpanel"
        hidden={value !== index}>
            <Box sx={{ p: 3, width: "100%", minHeight: "400px" }}>
                {children}
            </Box>
        </div>
    );
};