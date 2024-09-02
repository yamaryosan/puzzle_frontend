'use client';

import React, { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface ViewerProps {
  defaultValue: string;
}

const Viewer = forwardRef<Quill, ViewerProps>(
    ({ defaultValue }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);

    useImperativeHandle(ref, () => quillRef.current as Quill, []);

    useEffect(() => {
        if (!containerRef.current) return;

        // Quillの動的インポート(500エラーを回避)
        import('quill').then((Quill) => {
        quillRef.current = new Quill.default(containerRef.current!, {
            readOnly: true,
            modules: {
            toolbar: false
            },
            theme: 'snow'
        })
        // 初期値を設定
        quillRef.current.root.innerHTML = defaultValue;
        });
        
        // リソースの解放
        return () => {
        quillRef.current = null;
        };
    }, [defaultValue]);

    return <div ref={containerRef} style={{ height: '100%' }}></div>;
});

Viewer.displayName = 'Viewer';

export default Viewer;