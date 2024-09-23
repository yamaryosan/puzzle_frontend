import { Box, Button } from "@mui/material"
import { Puzzle } from "@prisma/client";
import { EmojiObjects, Edit } from "@mui/icons-material";
import Link from "next/link";
import DifficultViewer from "@/lib/components/DifficultyViewer";
import DescriptionViewer from "@/lib/components/DescriptionViewer";
import CommonButton from "@/lib/components/common/CommonButton";

type PuzzleInfoProps = {
    puzzle: Puzzle;
};

/**
 * パズル情報を表示するコンポーネント
 * カードをクリックすることで表示される
 */
export default function PuzzleInfo({ puzzle }: PuzzleInfoProps) {

    return (
        <>
        <Box sx={{ padding: "1rem" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
                <span>難易度: </span>
                <DifficultViewer value={puzzle.difficulty}/>
            </Box>
            <DescriptionViewer descriptionHtml={puzzle.description} />

            <Link href={`/puzzles/${puzzle.id}/solve`}>
            <CommonButton color="secondary" onClick={() => {}}>
                <EmojiObjects />
                <span>解く</span>
            </CommonButton>
            </Link>

            <Link href={`/puzzles/${puzzle.id}/edit`}>
            <CommonButton color="secondary" onClick={() => {}}>
                <Edit />
                <span>編集</span>
            </CommonButton>
            </Link>
        </Box>
        </>
    );
}