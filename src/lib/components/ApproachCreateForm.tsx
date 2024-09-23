'use client';

import { useState, useRef } from "react";
import Quill from 'quill';
import { Box } from "@mui/material";
import { AddCircleOutline, Upload } from "@mui/icons-material";
import TitleEditor from "@/lib/components/TitleEditor";
import { useRouter } from "next/navigation";
import { Approach } from "@prisma/client";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { useContext } from "react";
import Delta from 'quill-delta';
import DescriptionEditor from "@/lib/components/DescriptionEditor";
import CommonButton from "@/lib/components/common/CommonButton";

type Range = {
    index: number;
    length: number;
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

export default function ApproachCreateForm() {
    const router = useRouter();
    const [title, setTitle] = useState<string>('');

    const descriptionRef = useRef<Quill | null>(null);
    const [, setRange] = useState<Range | null>(null);
    const [, setLastChange] = useState<Delta | null>(null);

    const user = useContext(FirebaseUserContext);

    // 送信ボタン押下時の処理
    const handleSendButton = async () => {
        if (!title) {
            alert("タイトルを入力してください");
            return;
        }
        const description = descriptionRef.current?.editor.delta.ops.map((op: any) => op.insert).join("");
        if (description?.trim() === "") {
            alert("説明文を入力してください");
            return;
        }
        const approach = await send(title, user?.uid ?? '', descriptionRef);
        if (approach) {
            router.push(`/approaches/${approach.id}?created=true`);
        }
    }

    return (
        <>
        <Box  sx={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '1rem' }}>
            <h2>
                <AddCircleOutline />
                <span>定石作成</span>
            </h2>
            <TitleEditor title={title} setTitle={setTitle} />

            <DescriptionEditor
            containerRef={descriptionRef}
            onSelectionChange={setRange}
            onTextChange={setLastChange} />

            <CommonButton color="secondary" onClick={handleSendButton} width="100%">
                <Upload />
                <span>作成</span>
            </CommonButton>
        </Box>
        </>
    );
}