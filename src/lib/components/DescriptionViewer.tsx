import { Box } from "@mui/material";
import Viewer from '@/lib/components/Viewer';
import Delta from 'quill-delta';

export default function DescriptionViewer({ descriptionDelta }: { descriptionDelta: Delta }) {
    return (
        <Box sx={{ paddingY: '0.5rem' }}>
            <h3>問題文</h3>
            <Viewer defaultValue={descriptionDelta ?? new Delta()} />
        </Box>        
    )
}