import { useState, MutableRefObject, useEffect } from "react";
import Quill from "quill";

import HintEditor from "@/lib/components/HintEditor";
import DeltaClass from 'quill-delta';
import { Box } from "@mui/material";

type HintsEditorProps = {
    maxHints: number;
    defaultValues: DeltaClass[];
    hintQuills: MutableRefObject<Quill | null>[];
}

/**
 * 複数ヒントの編集用エディタ
 * @returns 
 */
export default function HintsEditor({ maxHints, defaultValues, hintQuills }: HintsEditorProps) {
    // 各ヒントをトグルできるかどうか(できない場合はdisabled)
    const [canToggle, setCanToggle] = useState(() => Array(maxHints).fill(false));
    // 各ヒントの表示/非表示状態
    const [show, setShow] = useState(() => Array(maxHints).fill(false));

    useEffect(() => {
        const newCanToggle = Array(maxHints).fill(false);
        let allPreviousShown = true; // すべての前のヒントが表示されているかどうか

        for (let i = 0; i < maxHints; i++) {
            // 最初のヒントはトグル可
            if (i === 0) {
                newCanToggle[i] = true;
            }
            // すべての前のヒントが表示されている場合、トグル可
            if (allPreviousShown && show[i - 1]) {
                newCanToggle[i] = true;
            }
            if (!show[i]) {
                allPreviousShown = false;
            }

            // すべての後のヒントが非表示の場合、トグル不可
            if (show.slice(i + 1).some(s => s)) {
                newCanToggle[i] = false;
            }
        }

        setCanToggle(newCanToggle);
    }, [show, maxHints]);

    // トグルボタンがクリックされたときの処理(表示/非表示を切り替える)
    const toggleShow = (index: number) => {
        setShow((prev) => {
            const next = [...prev];
            next[index] = !next[index];
            return next;
        });
    };

    return (
        <Box sx={{display: "flex", flexDirection: "row", width: "100%" }}>
            {Array.from({ length: maxHints }, (_, i) => (
                <Box key={i}
                sx={{
                    width: "100%",
                    padding: "0.5rem",
                    marginY: "0.5rem",
                    marginX: "0.25rem",
                    border: "1px solid #ccc",
                    borderRadius: "0.25rem",
                }}>
                    <h4>ヒント{`${i + 1}`}:</h4>
                    <HintEditor
                        quill={hintQuills[i]}
                        defaultValue={defaultValues[i]}
                        number={i}
                        canToggle={canToggle[i]}
                        show={show[i]}
                        toggleShow={() => toggleShow(i)} />
                </Box>
            ))}
        </Box>
    )
}