import { Box, Typography } from "@mui/material";

type HintTabPanelProps = {
    children: React.ReactNode;
    value: number;
    index: number;
};

export default function HintTabPanel({ children, value, index }: HintTabPanelProps) {
    return (
        <Box
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}>
            {value === index && (
                <Box sx={{ p: 3, width: "100%", height: "400px" }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </Box>
    );
};