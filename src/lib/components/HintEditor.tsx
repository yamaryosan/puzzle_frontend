import { MutableRefObject, useState } from 'react';
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
    quill: MutableRefObject<Quill | null>;
    number: number;
    show: boolean;
    onToggle: () => void;
    canToggle: boolean;
};

export default function HintEditor({ quill, number, show, onToggle, canToggle }: HintEditorProps) {
    const [range, setRange] = useState<Range | undefined>(undefined);
    const [lastChange, setLastChange] = useState<Change | undefined>(undefined);
    const [_, setShow] = useState(false);

    return (
        <div>
            <button onClick={onToggle} disabled={!canToggle}>追加</button>
            {show && (
                <div>
                    <p>ヒント</p>
                    <Editor
                    readOnly={false}
                    defaultValue={new DeltaClass([{ insert: 'Hello World!' }])}
                    onSelectionChange={setRange}
                    onTextChange={setLastChange}
                    ref={quill}
                    />
                </div>
            )}
        </div>
    )
}