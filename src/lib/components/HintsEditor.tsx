import { useState, MutableRefObject, useEffect } from "react";
import Quill from "quill";

import HintEditor from "@/lib/components/HintEditor";
import DeltaClass from 'quill-delta';
import { Box } from "@mui/material";
import DeviceTypeContext from "@/lib/context/DeviceTypeContext";
import { useContext } from "react";

type HintsEditorProps = {
    maxHints: number;
    defaultValues: DeltaClass[];
    refs: MutableRefObject<Quill | null>[];
}

/**
 * 複数ヒントの編集用エディタ
 * @returns 
 */
export default function HintsEditor({ maxHints, defaultValues, refs }: HintsEditorProps) {
    // 各ヒントをトグルできるかどうか(できない場合はdisabled)
    const [canToggle, setCanToggle] = useState(() => Array(maxHints).fill(false));
    // 各ヒントの表示/非表示状態
    const [show, setShow] = useState(() => Array(maxHints).fill(false));

    const deviceType = useContext(DeviceTypeContext);

    useEffect(() => {
        for (const defaultValue of defaultValues) {
            const letters = Object.keys(defaultValue?.ops[0] ?? {}).length;
            if (letters > 0) {
                setShow((prev) => {
                    const next = [...prev];
                    next[prev.indexOf(false)] = true;
                    return next;
                });
            }
        }
    }, [defaultValues]);

    // トグルされるべき項目を返す
    const toggleable = (arr: boolean[]) => {
        // 最後のtrueのインデックスを取得
        const lastTrueIndex = arr.lastIndexOf(true);
        // 一つもtrueがない場合、最初だけをtrueにした配列を返す
        if (lastTrueIndex === -1) {
            return arr.map((_, index) => index === 0);
        }
        // 最後のtrueとその次の項目をtrueにした配列を返す
        return arr.map((_, index) => index === lastTrueIndex || index === lastTrueIndex + 1);
    };

    useEffect(() => {
        setCanToggle(toggleable(show));
    }, [show]);

    // トグルボタンがクリックされたときの処理(表示/非表示を切り替える)
    const toggleShow = (index: number) => {
        setShow((prev) => {
            const next = [...prev];
            next[index] = !next[index];
            return next;
        });
    };

    return (
        <Box sx={{ paddingY: '0.5rem' }}>
            <h3>ヒント</h3>
            <Box sx={{display: "flex", flexDirection: "column", width: "100%" }}>
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
                            hintRef={refs[i]}
                            defaultValue={defaultValues[i]}
                            number={i}
                            canToggle={canToggle[i]}
                            show={show[i]}
                            toggleShow={() => toggleShow(i)} />
                    </Box>
                ))}
            </Box>
        </Box>
    )
}