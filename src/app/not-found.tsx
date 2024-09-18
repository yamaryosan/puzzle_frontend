import { Box, Typography } from "@mui/material";

export default function NotFound() {
    return (
        <Box sx={{ textAlign: "center" }}>
            <Typography variant="h1" sx={{ fontSize: "10rem" }}>404</Typography>
            <Typography variant="h2">Page Not Found</Typography>
            <Typography variant="body1">The page you are looking for does not exist.</Typography>
        </Box>
    );
}