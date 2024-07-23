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

/**
 * 画像アップロード処理
 * @param {File} file 画像ファイル
 * @returns {Promise<string>} 画像のURL
 */
const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch('/api/images', {
    method: 'POST',
    body: formData,
  });
  return response.text();
};

/**画像挿入処理
 * @param {Quill} quill Quillインスタンス
 * @param {File} file 画像ファイル
 */
const insertImage = async(quill: Quill, file: File) => {
  const imageUrl = await uploadImage(file);
  const range = quill.getSelection();
  quill.insertEmbed(range?.index || 0, 'image', imageUrl);
};

/** 画像ハンドラ (ツールバー用)
 * @param {Quill} quill - Quillインスタンス
 */
const imageHandler = async(quill: Quill) => {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();

  input.onchange = async () => {
    const file = input.files?.[0];
    if (file) {
      console.log("画像がアップロードされます");
      await insertImage(quill, file);
    }
  };
};

/**
 * 画像ペースト時の処理
 * @param {ClipboardEvent} event クリップボードイベント
 * @param {Quill} quill Quillインスタンス
 */
const pasteImageHandler = async (event: ClipboardEvent, quill: Quill) => {
  const file = event.clipboardData?.items;
  if (!file) {
    return;
  }
  // 画像ファイルごとに処理を行う
  for (let i = 0; i < file.length; i++) {
    // 画像以外はスキップ
    if (file[i].type.indexOf('image') === -1) {
      continue;
    }
    event.preventDefault();
    const imageFile = file[i].getAsFile();
    if (imageFile) {
      console.log("画像がペーストされます")
      await insertImage(quill, imageFile);
    }
    return; // 画像が見つかったら終了
  }
};

/**
 * 画像ドラッグアンドドロップ時の処理
 * @param {DragEvent} event ドラッグイベント
 * @param {Quill} quill Quillインスタンス
 */
const dropImageHandler = async (event: DragEvent, quill: Quill) => {
  event.preventDefault();
  event.stopPropagation();
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type.startsWith('image/')) {
      const range = quill.getSelection(true);
      await insertImage(quill, file);
      // カーソルを画像の後ろに移動
      quill.setSelection((range?.index || 0) + 1);
    }
  }
};

/** エディタのコンポーネント
 * @param {boolean} readOnly - 読み取り専用かどうか
 * @param {Delta} defaultValue - 初期値
 * @param {Function} onTextChange - テキストが変更されたときのコールバック
 * @param {Function} onSelectionChange - 選択範囲が変更されたときのコールバック
 * @param {Ref} ref - エディタのrefオブジェクト
 * @returns {React.ReactElement} エディタのコンポーネント
 */

/**
 * パズルエディタのコンポーネント
 */
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

        // 画像ドラッグアンドドロップ時の処理
        editorContainer.addEventListener('drop', async (event: DragEvent) => {
          await dropImageHandler(event, quillInstance);
        }, true);

        // 画像ペースト時の処理
        editorContainer.addEventListener('paste', async (event: ClipboardEvent) => {
          pasteImageHandler(event, quillInstance);
        }, true);

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