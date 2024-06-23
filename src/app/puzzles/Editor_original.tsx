'use client';

import React, { forwardRef, useEffect, useState, useLayoutEffect, useRef, MutableRefObject } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface EditorProps {
  readOnly: boolean;
  defaultValue: any;
  onTextChange: (delta: any, oldDelta: any, source: string) => void;
  onSelectionChange: (range: any, oldRange: any, source: string) => void;
}

/** エディタのコンポーネント
 * @param {boolean} readOnly - 読み取り専用かどうか
 * @param {any} defaultValue - 初期値
 * @param {Function} onTextChange - テキストが変更されたときのコールバック
 * @param {Function} onSelectionChange - 選択範囲が変更されたときのコールバック
 * @param {Ref} ref - エディタのrefオブジェクト
 * @returns {React.ReactElement} エディタのコンポーネント
 */

const Editor = forwardRef<Quill, EditorProps>(
  ({ readOnly, defaultValue, onTextChange, onSelectionChange }, ref) => {

    const containerRef = useRef<HTMLDivElement>(null);
    const defaultValueRef = useRef<any>(defaultValue);
    const onTextChangeRef = useRef<typeof onTextChange>(onTextChange);
    const onSelectionChangeRef = useRef<typeof onSelectionChange>(onSelectionChange);

    // レイアウトの変更を検知
    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });

    // Quillのインスタンスを取得
    useEffect(() => {
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.enable(!readOnly);
      }
    }, [ref, readOnly]);

    // エディタの初期化
    useEffect(() => {
      const container = containerRef.current;
      if (!container) {
        return;
      }
      const editorContainer = container?.appendChild(
        container.ownerDocument.createElement('div'),
      );
      const quill = new Quill(editorContainer, {
        theme: 'snow',
      });

      // Quillのインスタンスを設定
      if (ref) {
        if (typeof ref === 'function') {
          ref(quill);
        } else {
          (ref as MutableRefObject<Quill>).current = quill;
        }
      }

      // 初期値を設定
      if (defaultValueRef.current) {
        quill.setContents(defaultValueRef.current);
      }

      // テキストが変更されたときのコールバック
      quill.on(Quill.events.TEXT_CHANGE, (...args) => {
        onTextChangeRef.current?.(...args);
      });

      // 選択範囲が変更されたときのコールバック
      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        onSelectionChangeRef.current?.(...args);
      });

      // クリーンアップ
      return () => {
        if (ref) {
          if (typeof ref === 'function') {
            ref(null);
          } else {
            (ref as MutableRefObject<Quill | null>).current = null;
          }
        }
        container.innerHTML = '';
      };
    }, [ref]);

    // エディタのコンポーネントを返す
    return <div ref={containerRef}></div>;
  },
);