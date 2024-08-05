'use client';

import Link from "next/link";
import Editor from "@/lib/components/Editor";
import { useState, useEffect, useRef } from "react";
import Quill from 'quill';

type Range = {
    index: number;
    length: number;
};

type Change = {
    ops: any[];
};

/**
 * タイトルを定石を送信
 * @param title タイトル
 * @param quill エディタのQuill
 * @returns 
 */
async function send(title: string, quill: React.RefObject<Quill | null>) {
    try {
        if (!title) {
            title = 'Untitled';
        }
        if (!quill.current) {
            console.error('Quillの参照が取得できません');
            return;
        }
        const contentHtml = quill.current.root.innerHTML;

        const response = await fetch('/api/approaches', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                contentHtml,
            }),
        });
        if (!response.ok) {
            const error = await response.json();
            console.error('定石の作成に失敗: ', error);
        }
        console.log('定石を作成しました');
    } catch (error) {
        console.error('定石の作成に失敗: ', error);
    }
}

export default function Page() {
    const [title, setTitle] = useState<string>('');
    const [range, setRange] = useState<Range>();
    const [lastChange, setLastChange] = useState<Change>();
    const [DeltaClass, setDeltaClass] = useState<any>();

    const quill = useRef<Quill | null>(null);

    useEffect(() => {
        // Deltaクラスを取得
        import('quill').then((module) => {
            const DeltaClass = module.default.import('delta');
            setDeltaClass(() => DeltaClass);
        });
    });

    if (!DeltaClass) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Editor
            ref={quill}
            readOnly={false}
            defaultValue={new DeltaClass([{ insert: 'Hello World!' }])}
            onSelectionChange={setRange}
            onTextChange={setLastChange}
            />
            <button onClick={() => send(title, quill)}>送信</button>
            <Link href="/approaches">戻る</Link>
        </div>
    );
}