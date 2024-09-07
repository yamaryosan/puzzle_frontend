'use client';

import Editor from '@/lib/components/Editor';
import { useState, useEffect, useRef } from 'react';
import { getApproach } from '@/lib/api/approachApi';
import Quill from 'quill';
import { Approach } from '@prisma/client';
import { Box, Button } from '@mui/material';
import { Edit, Upload } from '@mui/icons-material';
import TitleEditor from '@/lib/components/TitleEditor';
import useAuth from '@/lib/hooks/useAuth';
import RecommendSignInDialog from '@/lib/components/RecommendSignInDialog';
import { useRouter } from 'next/navigation';

type PageParams = {
    id: string;
};

type Range = {
    index: number;
    length: number;
};

type Change = {
    ops: any[];
};

/**
 * 定石を更新
 * @param title
 * @param id
 * @param quill 
 */
async function send(title: string, id: string, quill: React.RefObject<Quill | null>) {
    try {
        if (!title) {
            title = 'Untitled';
        }
        if (!quill.current) {
            console.error('Quillの参照が取得できません');
            return;
        }
        const contentHtml = quill.current.root.innerHTML;

        const response = await fetch(`/api/approaches/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                contentHtml,
            }),
        });
        if (!response.ok) {
            const error = await response.json();
            console.error('定石の更新に失敗: ', error);
        }
        console.log('定石を更新しました');
        const approach = await response.json();
        return approach as Approach;
    } catch (error) {
        console.error('定石の更新に失敗: ', error);
    }
}

export default function Page({ params }: { params: PageParams }) {
    const router = useRouter();
    const [title, setTitle] = useState<string>('');
    const [approach, setApproach] = useState<Approach>();
    const [range, setRange] = useState<Range>();
    const [lastChange, setLastChange] = useState<Change>();
    const [DeltaClass, setDeltaClass] = useState<any>();

    const quill = useRef<Quill | null>(null);

    const { user, userId } = useAuth();

    // 編集前に以前の定石を取得
    useEffect(() => {
        if (!params.id) {
            return;
        }
        async function fetchApproach() {
            const approach = await getApproach(params.id, userId ?? '') as Approach;
            setApproach(approach);
        }
        fetchApproach();
    }, [params.id, userId]);

    // 編集前に以前の定石を取得
    useEffect(() => {
        if (approach?.content) {
            import('quill').then((Quill) => {
                const quill = new Quill.default(document.createElement('div'));
                const delta = quill.clipboard.convert({ html: approach.content });
                setDeltaClass(delta);
            });
        }
        setTitle(approach?.title || '');
    }, [approach]);

    // 送信ボタン押下時の処理
    const handleSendButton = async () => {
        if (!title) {
            alert("タイトルを入力してください");
            return;
        }
        const description = quill.current?.editor.delta.ops.map((op: any) => op.insert).join("");
        if (description?.trim() === "") {
            alert("説明文を入力してください");
            return;
        }
        const approach = await send(title, params.id, quill);
        if (approach) {
            router.push(`/approaches/${approach.id}?edited=true`);
        }
    }

    return (
        <>
        {user ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '1rem' }}>
            <h2>
                <Edit />
                <span>定石編集</span>
            </h2>
            <TitleEditor title={title} setTitle={setTitle} />

            <Box sx={{ paddingY: '0.5rem' }}>
                <h3>説明文</h3>
                <Editor
                ref={quill}
                readOnly={false}
                defaultValue={DeltaClass}
                onSelectionChange={setRange}
                onTextChange={setLastChange}/>
            </Box>
            
            <Button onClick={handleSendButton}
                sx={{
                    padding: '1.5rem',
                    backgroundColor: 'secondary.light',
                    width: '100%',
                    ":hover": {
                        backgroundColor: 'secondary.main',
                    }
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', scale: "1.8", color: "black" }}>
                        <Upload />
                        <span>編集完了</span>
                    </Box>                    
                </Button>
        </Box>
        ) : (
            <div>
                <RecommendSignInDialog />
            </div>
        )}
        </>
    );
}