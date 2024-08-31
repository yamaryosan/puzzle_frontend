import { Box } from "@mui/material";

type HintTabPanelProps = {
    children: React.ReactNode;
    value: number;
    index: number;
};

export default function HintTabPanel({ children, value, index }: HintTabPanelProps) {
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