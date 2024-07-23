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
 * @param title タイトル
 * @param quillDescriptionRef 本文のQuillの参照
 * @param quillSolutionRef 正答のQuillの参照
 */
async function send(title: string, quillDescriptionRef: React.RefObject<Quill | null>, quillSolutionRef: React.RefObject<Quill | null>): Promise<Puzzle | undefined> 
{
    // タイトルが空の場合はUntitledとする
    if (!title) {
        title = "Untitled";
    }
    // Quillの参照が取得できない場合はエラー
    if (!quillDescriptionRef.current || !quillSolutionRef.current) {
        console.error("Quillの参照が取得できません");
        return;
    }
    const descriptionHtml = quillDescriptionRef.current.root.innerHTML;
    const solutionHtml = quillSolutionRef.current.root.innerHTML;
    const difficulty = 1;
    const is_favorite = false;

    const response = await fetch("/api/puzzles", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, descriptionHtml, solutionHtml, difficulty, is_favorite }),
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

    // タイトル
    const [title, setTitle] = useState<string>("");
    // パズル本文と正答のQuill
    const quillDescriptionRef = useRef<Quill | null>(null);
    const quillSolutionRef = useRef<Quill | null>(null);

    // Deltaクラスを取得
    import('quill').then((module) => {
        const DeltaClass = module.default.import('delta');
        setDeltaClass(() => DeltaClass);
    });

    if (!DeltaClass) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <p>タイトル</p>
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required/>
            {/* 本文(description) */}
            <p>内容</p>
            <Editor
            ref={quillDescriptionRef}
            readOnly={readOnly}
            defaultValue={new DeltaClass([{ insert: 'Hello World!' }])}
            onSelectionChange={setRange}
            onTextChange={setLastChange}
            />
            <p>正答</p>
            {/* 正答(solution) */}
            <Editor
            ref={quillSolutionRef}
            readOnly={readOnly}
            defaultValue={new DeltaClass([{ insert: 'Hello World!' }])}
            onSelectionChange={setRange}
            onTextChange={setLastChange}
            />
            {/* 内容を送信 */}
            <button type="button" onClick={() => send( title, quillDescriptionRef, quillSolutionRef)}>
                Send
            </button>
        </div>
    );
}