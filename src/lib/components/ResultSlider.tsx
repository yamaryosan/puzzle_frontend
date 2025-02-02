import { Puzzle } from "@prisma/client";
import { useState, useEffect } from "react";
import { Box, Grow, List, ListItem, ListItemText, Paper } from "@mui/material";
import Link from "next/link";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { useContext } from "react";

type ResultSliderProps = {
    result: Puzzle[];
};

export default function ResultSlider({ result }: ResultSliderProps) {
    const [show, setShow] = useState(false);
    const [length, setLength] = useState(0);
    const user = useContext(FirebaseUserContext);

    // 検索結果がある場合は表示
    useEffect(() => {
        if (!user) return;
        if (result?.length > 0) {
            setShow(true);
            setLength(result.length);
        }
        return () => {
            setShow(false);
        };
    }, [result, user]);

    const handleClose = () => {
        setShow(false);
    };

    return (
        <>
            <Grow
                in={show}
                style={{ transformOrigin: "0 0 0" }}
                {...(show ? { timeout: 300 } : {})}
            >
                <Paper
                    elevation={3}
                    sx={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        width: "300px",
                        maxHeight: "300px",
                        overflowY: "auto",
                        zIndex: 1,
                        mt: 1,
                    }}
                >
                    <p style={{ padding: "0.5rem" }}>{length}件の検索結果</p>
                    <List>
                        {result?.slice(0, 5).map((puzzle) => (
                            <ListItem
                                key={puzzle.id}
                                component={Link}
                                href={`/puzzles/${puzzle.id}`}
                                onClick={handleClose}
                                sx={{
                                    textDecoration: "none",
                                    color: "inherit",
                                    borderBottom: "1px solid #e0e0e0",
                                    "&:hover": {
                                        backgroundColor: "primary.light",
                                        transition: "background-color 0.3s",
                                    },
                                }}
                            >
                                <ListItemText primary={puzzle.title} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Grow>
        </>
    );
}
