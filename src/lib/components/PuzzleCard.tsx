import Link from "next/link";
import { Card } from "@mui/material";

type PuzzleCardProps = {
    id: number;
    title: string;
};

export default function PuzzleCard({id, title}: PuzzleCardProps) {
    return (
        <Link href={`/puzzles/${id}`}>
            <Card variant="outlined"
                sx={{
                    marginY: 1,
                    padding: "1rem",
                    ":hover": {
                        backgroundColor: "secondary.light",
                    },
                    cursor: "pointer"
                }}
            >
                <h2>{title}</h2>
            </Card>
        </Link>
    );
}