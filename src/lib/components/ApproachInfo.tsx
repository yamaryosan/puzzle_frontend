import { Approach, Puzzle } from "@prisma/client";
import { useState, useEffect } from "react";
import { getPuzzlesByApproachId } from "@/lib/api/approachApi";
import { Button, Box } from "@mui/material";
import { Update } from "@mui/icons-material";
import Link from "next/link";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { useContext } from "react";
import DeviceTypeContext from "@/lib/context/DeviceTypeContext";

type ApproachInfoProps = {
    approach: Approach;
    isActive: boolean;
};

export default function ApproachInfo({
    approach,
    isActive,
}: ApproachInfoProps) {
    const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
    const user = useContext(FirebaseUserContext);

    const deviceType = useContext(DeviceTypeContext);

    // 定石に紐づくパズル一覧を取得
    useEffect(() => {
        const fetchPuzzles = async () => {
            try {
                if (!user) return;
                const data = (await getPuzzlesByApproachId(
                    approach.id.toString(),
                    user.uid ?? ""
                )) as Puzzle[];
                setPuzzles(data);
            } catch (error) {
                console.error("定石に紐づくパズル一覧の取得に失敗: ", error);
            }
        };
        fetchPuzzles();
    }, [approach.id, user]);

    return (
        <>
            <h3 style={{ display: "inline-block" }}>{approach.title}</h3>
            {isActive && (
                <>
                    <Link href={`/approaches/${approach.id}/edit`}>
                        {deviceType === "mobile" && (
                            <Button
                                sx={{
                                    color: "black",
                                    display: "flex",
                                    alignItems: "center",
                                    width: "100%",
                                    gap: "0.5rem",
                                    fontSize: "1rem",
                                    border: "1px solid black",
                                    "&:active": {
                                        backgroundColor: "secondary.main",
                                    },
                                }}
                            >
                                <Update />
                                <span>編集</span>
                            </Button>
                        )}
                        {deviceType === "desktop" && (
                            <Button
                                sx={{
                                    color: "black",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                }}
                            >
                                <Update />
                                <span>編集</span>
                            </Button>
                        )}
                    </Link>
                </>
            )}
            <Box
                sx={{
                    maxHeight: isActive ? "1000px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.5s ease-in-out",
                }}
            >
                {/* 定石に紐づくパズル一覧を表示 */}
                {puzzles.length === 0 ? (
                    <p style={{ fontSize: "1rem" }}>
                        この定石に紐づくパズルはありません
                    </p>
                ) : (
                    <>
                        <p style={{ fontSize: "1rem" }}>定石に紐づくパズル</p>
                        {puzzles.map((puzzle) => (
                            <Link
                                key={puzzle.id}
                                href={`/puzzles/${puzzle.id}`}
                            >
                                <Button
                                    sx={{
                                        display: "block",
                                        textAlign: "left",
                                        width: "100%",
                                        color: "black",
                                        "&:hover": {
                                            backgroundColor: "secondary.main",
                                        },
                                    }}
                                >
                                    <h4>{puzzle.title}</h4>
                                </Button>
                            </Link>
                        ))}
                    </>
                )}
            </Box>
        </>
    );
}
