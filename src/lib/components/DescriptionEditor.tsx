import { Box } from "@mui/material";
import Editor from "@/lib/components/Editor";
import Quill from "quill";
import Delta from "quill-delta";

type props = {
    containerRef: React.RefObject<Quill>,
    onSelectionChange: (range: { index: number, length: number } | null, oldRange: { index: number, length: number } | null, source: string) => void,
    onTextChange: (delta: Delta | null, oldDelta: Delta | null, source: string) => void,
}

export default function DescriptionEditor({ containerRef, onSelectionChange, onTextChange  }: props) {
    return (
        <Box sx={{ paddingY: '0.5rem' }}>
            <h3>問題文</h3>
            <Editor
            ref={containerRef}
            defaultValue={new Delta()}
            onSelectionChange={onSelectionChange}
            onTextChange={onTextChange} />
        </Box>
    )
}