'use client';

import React, { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface ViewerProps {
  readOnly: boolean;
  defaultValue: string;
}

const Viewer = forwardRef<Quill, ViewerProps>(({ readOnly, defaultValue }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  useImperativeHandle(ref, () => quillRef.current as Quill, []);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!quillRef.current) {
      quillRef.current = new Quill(containerRef.current, {
        readOnly: readOnly,
        modules: {
          toolbar: false
        },
        theme: 'snow'
      });
    }

    // 初期値を設定
    quillRef.current.root.innerHTML = defaultValue;

    // Update readOnly state
    quillRef.current.enable(!readOnly);

    return () => {
      if (quillRef.current) {
        quillRef.current.off('text-change');
      }
    };
  }, [readOnly, defaultValue]);

  return <div ref={containerRef} style={{ height: '100%' }} />;
});

Viewer.displayName = 'Viewer';

export default Viewer;