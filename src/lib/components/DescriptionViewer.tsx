import { Box } from "@mui/material";
import Viewer from "@/lib/components/Viewer";

export default function DescriptionViewer({
    descriptionHtml,
}: {
    descriptionHtml: string;
}) {
    return (
        <Box sx={{ paddingY: "0.5rem" }}>
            <h4>本文</h4>
            <Viewer html={descriptionHtml} />
        </Box>
    );
}
