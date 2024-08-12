import { Box } from "@mui/material"
import { Puzzle } from "@prisma/client";
import Viewer from "@/lib/components/Viewer";
import Quill from "quill";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type PuzzleInfoModalProps = {
    puzzle: Puzzle;
};

/**
 * パズル情報を表示するモーダル
 * パズルの見出しをホバーすると表示される
 */
export default function PuzzleInfoModal({ puzzle }: PuzzleInfoModalProps) {
    const router = useRouter();
    const quillRef = useRef<Quill | null>(null);

    return (
        <>
        <Box sx={{
            position: "fixed",
            top: "15%",
            left: "15%",
            backgroundColor: "white",
            opacity: 0.9,
            border: "1px solid black",
            padding: "1rem",
        }}>
            <Viewer 
            readOnly={true}
            defaultValue={puzzle.description}
            ref={quillRef}
            />
            <Link href={`/puzzles/${puzzle.id}/solve`}>解く</Link>
        </Box>
        </>
    );
}