'use client';

import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import Editor from './Editor';

type Range = {
    index: number;
    length: number;
};

type Change = {
    ops: any[];
};

const App = () => {
    const [range, setRange] = useState<Range>();
    const [lastChange, setLastChange] = useState<Change>();
    const [readOnly, setReadOnly] = useState(false);
    const [Delta, setDelta] = useState<any>();

    const quillRef = useRef<Quill | null>(null);

    useEffect(() => {
        import('quill').then((module) => {
            const Delta = module.default.import('delta');
            setDelta(() => Delta);
        });
    }, []);

    if (!Delta) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <Editor
            ref={quillRef}
            readOnly={readOnly}
            defaultValue={new Delta([{ insert: 'Hello World!' }])}
            onSelectionChange={setRange}
            onTextChange={setLastChange}
            />
            <div className="controls">
                <label>
                Read Only:{' '}
                    <input
                    type="checkbox"
                    checked={readOnly}
                    onChange={(e) => setReadOnly(e.target.checked)}
                    />
                </label>
                <button
                className="controls-right"
                type="button"
                onClick={() => {
                    alert(quillRef.current?.getLength());
                }}
                >
                    Get Content Length
                </button>
            </div>
            <div className="state">
                    <div className="state-title">Current Range:</div>
                    {range ? JSON.stringify(range) : 'Empty'}
            </div>
            <div className="state">
                    <div className="state-title">Last Change:</div>
                    {lastChange ? JSON.stringify(lastChange.ops) : 'Empty'}
            </div>
            {/* テキストの内容を取得するボタン */}
            <button type="button" onClick={() => {
                alert(JSON.stringify(quillRef.current?.getContents()));
            }}>
                Send
            </button>
        </div>
    );
}

export default App;