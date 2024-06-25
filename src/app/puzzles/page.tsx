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

export default function App() {
    const [range, setRange] = useState<Range>();
    const [lastChange, setLastChange] = useState<Change>();
    const [readOnly, setReadOnly] = useState(false);
    const [DeltaClass, setDeltaClass] = useState<any>();

    const quillRef = useRef<Quill | null>(null);

    // Deltaクラスを取得
    import('quill').then((module) => {
        const DeltaClass = module.default.import('delta');
        setDeltaClass(() => DeltaClass);
    });

    // Deltaクラスが取得できるまでローディング画面を表示
    if (!DeltaClass) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <Editor
            ref={quillRef}
            readOnly={readOnly}
            defaultValue={new DeltaClass([{ insert: 'Hello World!' }])}
            onSelectionChange={setRange}
            onTextChange={setLastChange}
            />
            <div className="controls">
                {/* 読み取り専用チェックボックス */}
                <label>
                Read Only:{' '}
                    <input
                    type="checkbox"
                    checked={readOnly}
                    onChange={(e) => setReadOnly(e.target.checked)}
                    />
                </label>
                {/* テキストの文字数を取得するボタン */}
                <button
                className="controls-right"
                type="button"
                onClick={() => {
                    alert(quillRef.current?.getLength());
                }}
                >
                    文字数
                </button>
            </div>
            {/* 現在の選択範囲を表示 */}
            <div className="state">
                    <div className="state-title">Current Range:</div>
                    {range ? JSON.stringify(range) : 'Empty'}
            </div>
            {/* 最後の変更を表示 */}
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