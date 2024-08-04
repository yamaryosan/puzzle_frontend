import { useState } from "react";
import Quill from "quill";

import HintEditor from "@/lib/components/HintEditor";

/**
 * 複数ヒントの編集用エディタ
 * @returns 
 */
export default function HintsEditor() {
    const maxHints = 3;
    const [showHints, setShowHints] = useState([false, false, false]);
    const [hintQuills, setHintQuills] = useState<Quill[]>([]);
    return (
        <div>
            <HintEditor quill={hintQuills[0]} number={0} />
            <HintEditor quill={hintQuills[1]} number={1} />
            <HintEditor quill={hintQuills[2]} number={2} />
        </div>
    )
}