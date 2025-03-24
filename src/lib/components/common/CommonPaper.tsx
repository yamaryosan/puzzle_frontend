import { Paper, Box } from "@mui/material";

export default function CommonPaper({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Paper
            sx={{
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <Box sx={{ width: "100%" }}>{children}</Box>
        </Paper>
    );
}
