import { Box } from "@mui/material";
import Editor from "@/lib/components/Editor";
import Quill from "quill";
import Delta from "quill-delta";

type props = {
    defaultValue?: Delta;
    containerRef: React.RefObject<Quill>;
    onSelectionChange: (
        range: { index: number; length: number } | null,
        oldRange: { index: number; length: number } | null,
        source: string
    ) => void;
    onTextChange: (
        delta: Delta | null,
        oldDelta: Delta | null,
        source: string
    ) => void;
};

export default function DescriptionEditor({
    defaultValue,
    containerRef,
    onSelectionChange,
    onTextChange,
}: props) {
    return (
        <Box sx={{ paddingY: "0.5rem" }}>
            <h3>本文</h3>
            <Editor
                defaultValue={defaultValue || new Delta()}
                ref={containerRef}
                onSelectionChange={onSelectionChange}
                onTextChange={onTextChange}
            />
        </Box>
    );
}
