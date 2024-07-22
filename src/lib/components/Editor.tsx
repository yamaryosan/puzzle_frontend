'use client';

import React, { forwardRef, useEffect, useState, useLayoutEffect, useRef } from 'react';
import Quill from 'quill';
import Delta from 'quill-delta';
import 'quill/dist/quill.snow.css';

interface EditorProps {
  readOnly: boolean;
  defaultValue: any;
  onTextChange: (delta: any, oldDelta: any, source: string) => void;
  onSelectionChange: (range: any, oldRange: any, source: string) => void;
}

/** 画像アップロード処理
 * @param {Quill} quill - Quillインスタンス
 * @returns {Promise<string>} 画像のURL
 */
const imageHandler = (quill: Quill): void => {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();

  // 画像が選択されたときの処理
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    // 画像をアップロード
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch('/api/images', {
      method: 'POST',
      body: formData,
    });
    // 画像のURLを取得
    const imageUrl = await response.text();
    const range = quill.getSelection();
    console.log('image url:', imageUrl);
    // 画像を挿入
    quill.insertEmbed(range?.index || 0, 'image', imageUrl);
  };
};

/** エディタのコンポーネント
 * @param {boolean} readOnly - 読み取り専用かどうか
 * @param {Delta} defaultValue - 初期値
 * @param {Function} onTextChange - テキストが変更されたときのコールバック
 * @param {Function} onSelectionChange - 選択範囲が変更されたときのコールバック
 * @param {Ref} ref - エディタのrefオブジェクト
 * @returns {React.ReactElement} エディタのコンポーネント
 */
// デバッグ用Editorコンポーネント
const Editor = forwardRef<Quill, EditorProps>(
  ({ readOnly, defaultValue, onTextChange, onSelectionChange }, ref) => {

    const containerRef = useRef<HTMLDivElement>(null);
    const defaultValueRef = useRef<Delta>(defaultValue);
    const onTextChangeRef = useRef<typeof onTextChange>(onTextChange);
    const onSelectionChangeRef = useRef<typeof onSelectionChange>(onSelectionChange);
    const [quill, setQuill] = useState<Quill | null>(null);

    // エディタの状態が変更されたときのコールバックを更新
    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    }, [onTextChange, onSelectionChange]);

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
        const quillInstance = new Quill(editorContainer, {
          modules: {
            toolbar: [
              [{ header: [1, 2, false] }],
              ['bold', 'italic', 'underline'],
              ['image', 'code-block'],
            ],
          },
          theme: 'snow',
        });
        // 画像のアップロード処理を設定
        (quillInstance.getModule('toolbar') as { addHandler: (format: string, handler: () => void) => void }).addHandler('image', () => {
          imageHandler(quillInstance);
        });
        setQuill(quillInstance);

        // Quillのインスタンスをrefに設定
        if (ref) {
          (ref as React.MutableRefObject<Quill>).current = quillInstance;
        }

        // 初期値を設定
        if (defaultValueRef.current) {
          quillInstance.setContents(defaultValueRef.current);
        }

        // テキストが変更されたときのコールバック
        quillInstance?.on(Quill.events.TEXT_CHANGE, (...args) => {
          onTextChangeRef.current?.(...args);
        });
        // 選択範囲が変更されたときのコールバック
        quillInstance?.on(Quill.events.SELECTION_CHANGE, (...args) => {
          onSelectionChangeRef.current?.(...args);
        });
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

Editor.displayName = 'Editor';

export default Editor;