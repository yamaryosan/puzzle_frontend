import { Puzzle } from "@prisma/client";
import {createPortal} from 'react-dom';
import {useState} from 'react';
import { Box } from "@mui/material";

type ResultModalProps = {
    result: Puzzle[];
};

export default function ResultModal({ result }: ResultModalProps) {
    const [show, setShow] = useState(false);

    const handleClose = () => {
        setShow(false);
    }

    return (
        <>
        {/* モーダル本体 */}
        <Box>
            <h2>検索結果</h2>
            <ul>
                {result.map((puzzle) => (
                    <li key={puzzle.id}>
                        <h3>{puzzle.title}</h3>
                    </li>
                ))}
            </ul>
        </Box>
        </>
    );
}