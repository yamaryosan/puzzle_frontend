import { useState, useCallback, MutableRefObject } from "react";
import Quill from "quill";

import HintEditor from "@/lib/components/HintEditor";
import DeltaClass from 'quill-delta';

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
    const [showHints, setShowHints] = useState(() => Array(maxHints).fill(false));

    // ヒントの表示切り替え
    const toggleHint = useCallback((index: number) => {
        setShowHints(prev => {
            const newShowHints = [...prev];
            newShowHints[index] = !newShowHints[index];
            return newShowHints;
        });
    }, []);

    const canToggleHint = (index: number) => {
        if (index === 0) return true;
        return showHints[index - 1];
    };

    return (
        <div>
            {Array.from({ length: maxHints }, (_, i) => (
                <HintEditor
                    key={i}
                    quill={hintQuills[i]}
                    defaultValue={defaultValues[i]}
                    number={i}
                    show={showHints[i]}
                    onToggle={() => toggleHint(i)}
                    canToggle={canToggleHint(i)}
                />
            ))}
        </div>
    )
}