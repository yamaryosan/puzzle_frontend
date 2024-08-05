'use client';

import Link from 'next/link';
import Editor from '@/lib/components/Editor';
import { useState, useEffect, useRef } from 'react';
import { getApproach } from '@/lib/api/approachApi';
import Quill from 'quill';
import { Approach } from '@prisma/client';

type PageParams = {
    id: string;
};

type Range = {
    index: number;
    length: number;
};

type Change = {
    ops: any[];
};

/**
 * 定石を更新
 * @param id
 * @param title 
 * @param quill 
 */
async function send(id: string, title: string, quill: React.RefObject<Quill | null>) {
    try {
        if (!title) {
            title = 'Untitled';
        }
        if (!quill.current) {
            console.error('Quillの参照が取得できません');
            return;
        }
        const contentHtml = quill.current.root.innerHTML;

        const response = await fetch(`/api/approaches/${id}`, {
            method: 'PUT',
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
            console.error('定石の更新に失敗: ', error);
        }
        console.log('定石を更新しました');
    } catch (error) {
        console.error('定石の更新に失敗: ', error);
    }
}

export default function Home({ params }: { params: PageParams }) {
    const [title, setTitle] = useState<string>('');
    const [approach, setApproach] = useState<Approach>();
    const [range, setRange] = useState<Range>();
    const [lastChange, setLastChange] = useState<Change>();
    const [DeltaClass, setDeltaClass] = useState<any>();

    const quill = useRef<Quill | null>(null);

    // 編集前に以前の定石を取得
    useEffect(() => {
        if (!params.id) {
            return;
        }
        async function fetchApproach() {
            const approach = await getApproach(Number(params.id));
            setApproach(approach);
        }
        fetchApproach();
    }, [params.id]);

    // 編集前に以前の定石を取得
    useEffect(() => {
        if (approach?.content) {
            import('quill').then((Quill) => {
                const quill = new Quill.default(document.createElement('div'));
                const delta = quill.clipboard.convert({ html: approach.content });
                setDeltaClass(delta);
            });
        }
        setTitle(approach?.title || '');
    }, [approach]);

    if (!DeltaClass) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required/>
            <Editor
                ref={quill}
                readOnly={false}
                defaultValue={DeltaClass}
                onSelectionChange={setRange}
                onTextChange={setLastChange}
            />
            <button onClick={() => send(params.id || "0", title, quill)}>送信</button>
        </div>
    );
}