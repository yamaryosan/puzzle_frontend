'use client';

import React, { useRef, useState } from 'react';
import Quill from 'quill';
import Editor from '@/lib/components/Editor';
import { Puzzle } from '@prisma/client';

type Range = {
    index: number;
    length: number;
};

type Change = {
    ops: any[];
};

/**
 * 内容を送信
 * @param quillRef Quillの参照
 */
async function send(quillRef: React.MutableRefObject<Quill | null>): Promise<Puzzle | undefined> {
    // Quillの参照が取得できない場合は何もしない
    if (!quillRef.current) {
        return;
    }
    const contentHtml = quillRef.current?.root.innerHTML;

    const response = await fetch("/api/puzzles", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ contentHtml }),
    });
    if (!response.ok) {
        const error = await response.json();
        console.error("パズルの作成に失敗: ", error);
    }
    const puzzle = await response.json();
    console.log("パズルの作成に成功: ", puzzle);
    return puzzle;
}

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
            {/* 内容を送信 */}
            <button type="button" onClick={() => send( quillRef )}>
                Send
            </button>
        </div>
    );
}