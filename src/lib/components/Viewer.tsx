'use client';

import React, { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface ViewerProps {
  readOnly: boolean;
  defaultValue: string;
}

const Viewer = forwardRef<Quill, ViewerProps>(
  ({ readOnly, defaultValue }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  useImperativeHandle(ref, () => quillRef.current as Quill, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Quillの動的インポート(500エラーを回避)
    import('quill').then((Quill) => {
      quillRef.current = new Quill.default(containerRef.current!, {
        readOnly: readOnly,
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
  }, []);

  return <div ref={containerRef} style={{ height: '100%' }}></div>;
});

Viewer.displayName = 'Viewer';

export default Viewer;