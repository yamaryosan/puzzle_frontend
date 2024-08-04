import { useState, useCallback, useRef } from "react";
import Quill from "quill";

import HintEditor from "@/lib/components/HintEditor";

/**
 * 複数ヒントの編集用エディタ
 * @returns 
 */
export default function HintsEditor() {
    const maxHints = 3;
    const [showHints, setShowHints] = useState(() => Array(maxHints).fill(false));
    const hintQuills = Array.from({length: maxHints}, () => useRef<Quill | null>(null));

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
                    number={i}
                    show={showHints[i]}
                    onToggle={() => toggleHint(i)}
                    canToggle={canToggleHint(i)}
                />
            ))}
        </div>
    )
}