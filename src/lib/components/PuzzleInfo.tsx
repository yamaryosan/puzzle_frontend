import { Box, Button } from "@mui/material"
import { Puzzle } from "@prisma/client";
import Viewer from "@/lib/components/Viewer";
import { EmojiObjects, Edit } from "@mui/icons-material";
import Link from "next/link";
import DifficultViewer from "@/lib/components/DifficultyViewer";
import Delta from "quill-delta";
import { useEffect, useState } from "react";

type PuzzleInfoProps = {
    puzzle: Puzzle;
};

/**
 * パズル情報を表示するコンポーネント
 * カードをクリックすることで表示される
 */
export default function PuzzleInfo({ puzzle }: PuzzleInfoProps) {

    const [desciptionDelta, setDescriptionDelta] = useState<Delta>();
    const [isLoading, setIsLoading] = useState(true);
    // パズルを取得
    useEffect(() => {
        async function setDesciptionDelta() {
            try {
                const module = await import('quill');
                const Delta = module.default.import('delta');
                const quill = new module.default(document.createElement('div'));
                const descriptionDelta = quill.clipboard.convert({ html: puzzle.description });
                setDescriptionDelta(new Delta(descriptionDelta.ops));
                setIsLoading(false);
            } catch (error) {
                console.error("パズルの取得に失敗: ", error);
            }
        }
        setDesciptionDelta();
    }, [puzzle]);

    if (isLoading) {
        return <Viewer defaultValue={new Delta()} />
    }

    return (
        <>
        <Box sx={{ padding: "1rem" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
                <span>難易度: </span>
                <DifficultViewer value={puzzle.difficulty}/>
            </Box>
            <Box>
                <p>問題文: </p>
                <Viewer defaultValue={desciptionDelta ?? new Delta()} />
            </Box>

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
            }}>
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
            }}>
                <Edit />
                <span>編集</span>
            </Button>
            </Link>
        </Box>
        </>
    );
}