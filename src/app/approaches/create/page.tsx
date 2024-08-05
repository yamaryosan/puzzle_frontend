'use client';

import Link from "next/link";
import Editor from "@/lib/components/Editor";
import { useState, useEffect } from "react";
import Quill from 'quill';

type Range = {
    index: number;
    length: number;
};

type Change = {
    ops: any[];
};

export default function Page() {
    const [range, setRange] = useState<Range>();
    const [lastChange, setLastChange] = useState<Change>();
    const [DeltaClass, setDeltaClass] = useState<any>();

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
            <input type="text" placeholder="Title" required/>
            <Editor 
            readOnly={false}
            defaultValue={new DeltaClass([{ insert: 'Hello World!' }])}
            onSelectionChange={setRange}
            onTextChange={setLastChange}
            />
            <Link href="/approaches">戻る</Link>
        </div>
    );
}