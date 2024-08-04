import { useState } from 'react';
import { Hint } from '@prisma/client';
import Editor from '@/lib/components/Editor';
import Quill from 'quill';
import DeltaClass from 'quill-delta';

type Range = {
    index: number;
    length: number;
};

type Change = {
    ops: any[];
};

type HintEditorProps = {
    quill: Quill | null;
    number: number;
};

export default function HintEditor({ quill, number }: HintEditorProps) {
    const [range, setRange] = useState<Range | undefined>(undefined);
    const [lastChange, setLastChange] = useState<Change | undefined>(undefined);
    const [show, setShow] = useState(false);

    // ヒントを表示
    const addHint = () => {
        setShow(true);
    };
    // ヒントを非表示
    const hideHint = () => {
        setShow(false);
    };

    return (
        <div>
            <button onClick={addHint}>追加</button>
            {show && (
                <div>
                    <p>ヒント</p>
                    <Editor
                    readOnly={false}
                    defaultValue={new DeltaClass([{ insert: 'Hello World!' }])}
                    onSelectionChange={setRange}
                    onTextChange={setLastChange}
                    />
                    <button onClick={hideHint}>閉じる</button>
                </div>
            )}
        </div>
    )
}