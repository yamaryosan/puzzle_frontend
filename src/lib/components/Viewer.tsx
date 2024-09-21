'use client';

import React, { forwardRef, useEffect, useRef } from 'react';
import Quill from 'quill';
import Delta from 'quill-delta';
import 'quill/dist/quill.snow.css';

type Range = {
    index: number;
    length: number;
};

type ViewerProps = {
    defaultValue: Delta;
    onSelectionChange: (range: Range | null, oldRange: Range | null, source: string) => void;
    onTextChange: (delta: Delta | null, oldDelta: Delta | null, source: string) => void;
}

const options = {
    // ツールバーを非表示
    modules: {
        toolbar: false,
    },
    theme: 'snow',
};

/** 閲覧用ビューワーのコンポーネント
 * @param {string} defaultValue - 初期値の文字列
 * @param {Function} onSelectionChange - 選択範囲が変更されたときのコールバック
 * @param {Function} onTextChange - テキストが変更されたときのコールバック
 * @param {Ref} ref - エディタのRefオブジェクト
 */
export const Viewer = forwardRef<Quill, ViewerProps>(
    ({ defaultValue, onSelectionChange, onTextChange }, ref) => {

    const containerRef = useRef<HTMLDivElement>(null);
    const defaultValueRef = useRef<Delta>(defaultValue);
    const onSelectionChangeRef = useRef<typeof onSelectionChange>(onSelectionChange);
    const onTextChangeRef = useRef<typeof onTextChange>(onTextChange);

    useEffect(() => {
        async function initializeQuillEditor() {
            const container = containerRef.current;
            if (!container) { return; }

            const editorContainer = container.appendChild(
                container.ownerDocument.createElement('div')
            );
            try {
                const module = await import('quill');
                const Quill = module.default;
                const quillInstance = new Quill(editorContainer, options);

                // 読み取り専用に設定
                quillInstance.enable(false);

                if (ref) {
                    (ref as React.MutableRefObject<Quill>).current = quillInstance;
                }

                if (defaultValueRef.current) {
                    console.log("初期値を設定します: ", defaultValueRef.current);
                    quillInstance.setContents(defaultValueRef.current);
                }

                quillInstance.on('text-change', (delta, oldDelta, source) => {
                    onTextChangeRef.current?.(delta, oldDelta, source);
                });

                quillInstance.on('selection-change', (range, oldRange, source) => {
                    onSelectionChangeRef.current?.(range, oldRange, source);
                });
            } catch(error) {
                console.error("エディタの初期化に失敗しました: ", error);
            }
        }
        initializeQuillEditor();
        // クリーンアップ
        return () => {
            const container = containerRef.current;
            if (!container) { return; }
            container.innerHTML = '';
        };
    }, []);
    
    return <div ref={containerRef}></div>;
    },
);
Viewer.displayName = 'Viewer';
export default Viewer;