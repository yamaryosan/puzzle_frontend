import { Box, Button } from "@mui/material"
import { Puzzle } from "@prisma/client";
import Viewer from "@/lib/components/Viewer";
import Quill from "quill";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";

type PuzzleInfoProps = {
    puzzle: Puzzle;
};

/**
 * パズル情報を表示するコンポーネント
 * カードをクリックすることで表示される
 */
export default function PuzzleInfo({ puzzle }: PuzzleInfoProps) {
    const quillRef = useRef<Quill | null>(null);

    return (
        <>
        <Box sx={{
            padding: "1rem",
        }}>
            <Viewer 
            readOnly={true}
            defaultValue={puzzle.description}
            ref={quillRef}
            />
            <Button className="text-red-500 hover:text-red-900">解く</Button>
        </Box>
        </>
    );
}