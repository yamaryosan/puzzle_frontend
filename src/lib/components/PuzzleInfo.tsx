import { Box, Button } from "@mui/material"
import { Puzzle } from "@prisma/client";
import Viewer from "@/lib/components/Viewer";
import Quill from "quill";
import { useRef, useState, useEffect } from "react";
import { EmojiObjects, Edit } from "@mui/icons-material";
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
            <Link href={`/puzzles/${puzzle.id}/solve`}>
            <Button
            sx={{
                marginTop: "1rem",
                width: "100%",
                ":hover": {
                    backgroundColor: "secondary.main",
                    transition: "background-color 0.3s",
                    border: "1px solid black",
                },
                color: "black",
            }}
            >
                <EmojiObjects />
                <span>解く</span>
            </Button>
            </Link>

            <Link href={`/puzzles/${puzzle.id}/edit`}>
            <Button
            sx={{
                marginTop: "1rem",
                width: "100%",
                ":hover": {
                    backgroundColor: "secondary.main",
                    transition: "background-color 0.3s",
                    border: "1px solid black",
                },
                color: "black",
            }}
            >
                <Edit />
                <span>編集</span>
            </Button>
            </Link>
        </Box>
        </>
    );
}