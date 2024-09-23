import { Box } from "@mui/material";
import Viewer from '@/lib/components/Viewer';

export default function DescriptionViewer({ descriptionHtml }: { descriptionHtml: string }) {
    return (
        <Box sx={{ paddingY: '0.5rem' }}>
            <h3>問題文</h3>
            <Viewer defaultHtml={descriptionHtml} />
        </Box>        
    )
}