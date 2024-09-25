'use client';

import React, { forwardRef, useEffect, useRef } from 'react';
import Quill from 'quill';
import Delta from 'quill-delta';
import 'quill/dist/quill.snow.css';

type ViewerProps = {
    defaultHtml: string;
}

const options = {
    // ツールバーを非表示
    modules: {
        toolbar: false,
    },
    theme: 'snow',
};

/** 閲覧用ビューワーのコンポーネント
 * @param {string} defaultHtml 初期値のHTML文字列
 * @param {Ref} ref エディタのRefオブジェクト
 */
export const Viewer = forwardRef<Quill, ViewerProps>(
    ({ defaultHtml }, ref) => {

    const containerRef = useRef<HTMLDivElement>(null);
    const defaultValueRef = useRef<Delta>();

    useEffect(() => {
        let container: HTMLDivElement | null = null;
        async function initializeQuillEditor() {
            container = containerRef.current;
            if (!container) { return; }

            const editorContainer = container.appendChild(
                container.ownerDocument.createElement('div')
            );
            try {
                const quillModule = await import('quill');
                const Quill = quillModule.default;
                const quillInstance = new Quill(editorContainer, options);
                // デフォルトのHTMLをDeltaに変換
                const Delta = quillModule.default.import('delta');
                const quill = new quillModule.default(document.createElement('div'));
                const delta = quill.clipboard.convert({ html: defaultHtml });
                defaultValueRef.current = new Delta(delta.ops);

                // 読み取り専用に設定
                quillInstance.enable(false);

                if (ref) {
                    (ref as React.MutableRefObject<Quill>).current = quillInstance;
                }

                if (defaultValueRef.current) {
                    console.log("初期値を設定します: ", defaultValueRef.current);
                    quillInstance.setContents(defaultValueRef.current);
                }
            } catch(error) {
                console.error("エディタの初期化に失敗しました: ", error);
            }
        }
        initializeQuillEditor();
        // クリーンアップ
        return () => {
            if (!container) { return; }
            container.innerHTML = '';
        };
    }, [defaultHtml, ref]);
    
    return <div ref={containerRef}></div>;
    },
);
Viewer.displayName = 'Viewer';
export default Viewer;