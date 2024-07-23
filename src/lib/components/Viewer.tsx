'use client';

import React, { forwardRef, useEffect, useState, useRef } from 'react';
import Quill from 'quill';
import Delta from 'quill-delta';
import 'quill/dist/quill.snow.css';

interface ViewerProps {
  readOnly: boolean;
  defaultValue: any;
}

/** エディタのコンポーネント
 * @param {boolean} readOnly - 読み取り専用かどうか
 * @param {Delta} defaultValue - 初期値
 * @param {Ref} ref - エディタのrefオブジェクト
 * @returns {React.ReactElement} エディタのコンポーネント
 */
// デバッグ用Editorコンポーネント
const Viewer = forwardRef<Quill, ViewerProps>(
  ({ readOnly, defaultValue }, ref) => {

    const containerRef = useRef<HTMLDivElement>(null);
    const defaultValueRef = useRef<Delta>(defaultValue);
    const [quill, setQuill] = useState<Quill | null>(null);

    // Quillのインスタンスを取得 (読み取り専用の設定)
    useEffect(() => {
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.enable(!readOnly);
      }
    }, [ref, readOnly]);

    useEffect(() => {
      // エディタのDOM要素を取得
      const container = containerRef.current;
      if (!container) {
        return;
      }
      const editorContainer = container?.appendChild(
        container.ownerDocument.createElement('div'),
      );
      // Quillの動的インポート、Quillインスタンス初期化
      import('quill').then((module) => {
        const Quill = module.default;
        const quillInstance = new Quill(editorContainer);

        setQuill(quillInstance);

        // Quillのインスタンスをrefに設定
        if (ref) {
          (ref as React.MutableRefObject<Quill>).current = quillInstance;
        }

        // 初期値を設定
        if (defaultValueRef.current) {
          quillInstance.setContents(defaultValueRef.current);
        }
      }
      );
      // クリーンアップ
      return () => {
        if (typeof ref === 'function') {
          ref(null);
        }
        container.innerHTML = '';
      };
    }, [ref]);

    return <div ref={containerRef}></div>;
  },
);

Viewer.displayName = 'Editor';

export default Viewer;