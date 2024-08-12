import { Box } from "@mui/material"
import { Puzzle } from "@prisma/client";
import Viewer from "@/lib/components/Viewer";
import Quill from "quill";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";

type PuzzleInfoModalProps = {
    puzzle: Puzzle;
};

/**
 * パズル情報を表示するモーダル
 * パズルの見出しをホバーすると表示される
 */
export default function PuzzleInfoModal({ puzzle }: PuzzleInfoModalProps) {
    const quillRef = useRef<Quill | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setIsReady(true);
      }, []);
    
      if (!isReady) return null;

    return (
        <>
        <Box sx={{
            position: "fixed",
            top: "15%",
            left: "15%",
            backgroundColor: "white",
            opacity: 0.7,
            border: "1px solid black",
            padding: "1rem",
            ":hover": {
                opacity: 1,
            }
        }}>
            <Viewer 
            readOnly={true}
            defaultValue={puzzle.description}
            ref={quillRef}
            />
            <Link href={`/puzzles/${puzzle.id}/solve`} className="text-red-500 hover:text-red-900">解く</Link>
        </Box>
        </>
    );
}