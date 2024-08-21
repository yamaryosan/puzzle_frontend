import { Puzzle } from "@prisma/client";
import { useState, useEffect} from 'react';
import { Box, Grow, List, ListItem, ListItemText, Paper } from "@mui/material";
import Link from "next/link";

type ResultSliderProps = {
    result: Puzzle[];
};

export default function ResultSlider({ result }: ResultSliderProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (result.length > 0) {
            setShow(true);
        }
        return () => {
            setShow(false);
        }
    }, [result]);

    const handleClose = () => {
        setShow(false);
    }

    return (
        <>
        {/* モーダル本体 */}
        <Grow in={show} style={{transformOrigin: "0 0 0"}} {...(show ? {timeout: 300} : {})}>
            <Paper
            elevation={3}
            sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                width: '300px',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 1,
                mt: 1,
            }}>
                <List>
                    {result.slice(0, 5).map((puzzle) => (
                        <ListItem
                            key={puzzle.id}
                            component={Link}
                            href={`/puzzles/${puzzle.id}`}
                            onClick={handleClose}
                            sx={{
                                textDecoration: 'none',
                                color: 'inherit',
                                borderBottom: '1px solid #e0e0e0',
                                '&:hover': {
                                backgroundColor: 'primary.light',
                                transition: 'background-color 0.3s',
                                },
                            }}>
                            <ListItemText primary={puzzle.title} />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Grow>
        </>
    );
}