'use client';

import Editor from "@/lib/components/Editor";
import { useState, useEffect, useRef } from "react";
import Quill from 'quill';
import { Box, Button } from "@mui/material";
import { AddCircleOutline, Upload } from "@mui/icons-material";
import TitleEditor from "@/lib/components/TitleEditor";
import RecommendSignInDialog from '@/lib/components/RecommendSignInDialog';
import { useRouter } from "next/navigation";
import { Approach } from "@prisma/client";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { useContext } from "react";

type Range = {
    index: number;
    length: number;
};

type Change = {
    ops: any[];
};

/**
 * タイトルを定石を送信
 * @param title タイトル
 * @param userId ユーザID
 * @param quill エディタのQuill
 * @returns 
 */
async function send(title: string, userId: string, quill: React.RefObject<Quill | null>) {
    try {
        if (!title) {
            title = 'Untitled';
        }
        if (!userId) {
            console.error('ユーザIDが取得できません');
            return;
        }
        if (!quill.current) {
            console.error('Quillの参照が取得できません');
            return;
        }
        const contentHtml = quill.current.root.innerHTML;

        const response = await fetch('/api/approaches', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, userId, contentHtml }),
        });
        if (!response.ok) {
            const error = await response.json();
            console.error('定石の作成に失敗: ', error);
        }
        console.log('定石を作成しました');
        const approach = await response.json();
        return approach as Approach;
    } catch (error) {
        console.error('定石の作成に失敗: ', error);
    }
}

export default function Page() {
    const router = useRouter();
    const [title, setTitle] = useState<string>('');
    const [range, setRange] = useState<Range>();
    const [lastChange, setLastChange] = useState<Change>();
    const [DeltaClass, setDeltaClass] = useState<any>();

    const quill = useRef<Quill | null>(null);

    const user = useContext(FirebaseUserContext);

    useEffect(() => {
        // Deltaクラスを取得
        import('quill').then((module) => {
            const DeltaClass = module.default.import('delta');
            setDeltaClass(() => DeltaClass);
        });
    });

    if (!DeltaClass) {
        return <div>Loading...</div>
    }

    if (!user) {
        return (
            <div>
                <RecommendSignInDialog />
            </div>
        );
    }

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
        const approach = await send(title, user.uid ?? '', quill);
        if (approach) {
            router.push(`/approaches/${approach.id}?created=true`);
        }
    }

    return (
        <>
        {user ? (
        <Box  sx={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '1rem' }}>
            <h2>
                <AddCircleOutline />
                <span>定石作成</span>
            </h2>
            <TitleEditor title={title} setTitle={setTitle} />

            <Box sx={{ paddingY: '0.5rem' }}>
                <h3>本文</h3>
                <Editor
                ref={quill}
                readOnly={false}
                defaultValue={new DeltaClass([{  }])}
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
                    <span>作成</span>
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