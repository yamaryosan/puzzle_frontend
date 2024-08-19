import { Approach, Puzzle } from "@prisma/client";
import { useState, useEffect } from "react";
import { getPuzzlesByApproachId } from "@/lib/api/approachApi";
import { Button, Box } from "@mui/material";
import { Edit, Update } from "@mui/icons-material";
import Link from "next/link";

type ApproachInfoProps = {
    approach: Approach;
    isActive: boolean;
};

export default function ApproachCard({ approach, isActive }: ApproachInfoProps) {
    const [approachTitle, setApproachTitle] = useState<string>(approach.title);
    const [puzzles, setPuzzles] = useState<Puzzle[]>([]);

    // 定石に紐づくパズル一覧を取得
    useEffect(() => {
        const fetchPuzzles = async () => {
            try {
                const data = await getPuzzlesByApproachId(approach.id.toString()) as Puzzle[];
                setPuzzles(data);
            } catch (error) {
                console.error("定石に紐づくパズル一覧の取得に失敗: ", error);
            }
        }
        fetchPuzzles();
    }, [approach.id]);

    // 編集ボタンクリック時のイベント
    const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
    }

    return (
        <>
        <h3 style={{display: "inline-block"}}>{approach.title}</h3>
        {isActive && (
            <>
            <Link href={`/approaches/${approach.id}/edit`}>
                <Button sx={{color: "black"}}>
                    <Update />
                    <span>編集</span>
                </Button>
            </Link>
            </>
        )}
        <Box sx={{
            maxHeight: isActive ? '1000px' : '0px',
            overflow: 'hidden',
            transition: 'max-height 0.5s ease-in-out',
        }}>
            {/* 定石に紐づくパズル一覧を表示 */}
            {puzzles.map((puzzle) => (
                <Link key={puzzle.id} href={`/puzzles/${puzzle.id}`}>
                    <Button
                    sx={{
                        display: 'block',
                        textAlign: 'left',
                        width: '100%',
                        color: 'black',
                        '&:hover': {
                            backgroundColor: "secondary.main",
                        },
                    }}
                    >
                        <h4>{puzzle.title}</h4>
                    </Button>
                </Link>
            ))}
        </Box>
        </>
    );
}