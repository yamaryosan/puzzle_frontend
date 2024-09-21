'use client';

import React, { useRef, useState, useEffect, useContext } from 'react';
import FirebaseUserContext from '@/lib/context/FirebaseUserContext';
import Quill from 'quill';
import Editor from '@/lib/components/Editor';
import Delta from 'quill-delta';
import TitleEditor from '@/lib/components/TitleEditor';
import HintsEditor from '@/lib/components/HintsEditor';
import CategoryCheckbox from '@/lib/components/CategoryCheckbox';
import ApproachCheckbox from '@/lib/components/ApproachCheckbox';
import DifficultEditor from '@/lib/components/DifficultyEditor';
import { Upload } from '@mui/icons-material';
import { Box, Button } from '@mui/material';


type Range = {
    index: number;
    length: number;
};

export default function PuzzleCreateForm() {
    const user = useContext(FirebaseUserContext);

    const [title, setTitle] = useState<string>('');

    const [, setRange] = useState<Range | null>(null);
    const [, setLastChange] = useState<Delta | null>(null);

    const maxHints = 3;
    const [checkedCategories, setCheckedCategories] = useState<number[]>([]);
    const [approachIds, setApproachIds] = useState<number[]>([]);
    const [difficulty, setDifficulty] = useState<number>(0);
    
    // エディタの参照を取得
    const editorRef = useRef<Quill | null>(null);
    
    useEffect(() => {
        // Deltaクラスを取得
        async function loadQuill() {
            const module = await import('quill');
            const Delta = module.default.import('delta');
        }
        loadQuill();
    }, []);

    if (!Delta) {
        return <div>Loading...</div>
    }

    // カテゴリー選択状態
    const handleCheckboxChange = (checkedCategories: number[]) => {
        setCheckedCategories(checkedCategories);
    };

    // 送信ボタン押下時の処理
    const handleSendButton = async () => {
        console.log(editorRef.current?.getContents());
    }

    return (
        <>
        <TitleEditor title={title} setTitle={setTitle} />

        <Box sx={{ paddingY: '0.5rem' }}>
            <h3>問題文</h3>
            <Editor
            ref={editorRef}
            defaultValue={new Delta()}
            onSelectionChange={setRange}
            onTextChange={setLastChange} />
        </Box>

        <Box sx={{ paddingY: '0.5rem' }}>
            <h3>正答</h3>
            <Editor
            ref={editorRef}
            defaultValue={new Delta()}
            onSelectionChange={setRange}
            onTextChange={setLastChange} />
        </Box>

        <Box sx={{ paddingY: '0.5rem' }}>
            <h3>ヒント</h3>
            <HintsEditor
            maxHints={maxHints}
            defaultValues={Array.from({ length: maxHints }, () => new Delta())} />
        </Box>

        <Box sx={{ paddingY: '0.5rem' }}>
            <h3>カテゴリー</h3>
            <CategoryCheckbox 
            userId={user?.uid || ""}
            onChange={handleCheckboxChange}
            puzzle_id="0"
            value={checkedCategories} />
        </Box>

        <Box sx={{ paddingY: '0.5rem' }}>
            <h3>定石</h3>
            <ApproachCheckbox
            onChange={setApproachIds}
            puzzle_id="0"
            value={approachIds} />
        </Box>

        <Box sx={{ paddingY: '0.5rem' }}>
            <h3>難易度</h3>
            <DifficultEditor value={difficulty} onChange={setDifficulty} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', paddingY: '1rem', marginY: '1rem' }}>
            <Button 
            sx={{
                padding: '1.5rem',
                backgroundColor: 'secondary.light',
                width: '100%',
                ":hover": {
                    backgroundColor: 'secondary.main',
                }
            }}
            onClick={() => handleSendButton()}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', scale: "1.8", color: "black" }}>
                    <Upload />
                    <span>作成</span>
                </Box>
            </Button>
        </Box>
        </>
    )
}