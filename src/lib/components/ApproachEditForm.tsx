'use client';

import { useState, useEffect, useRef } from 'react';
import { getApproach } from '@/lib/api/approachApi';
import Quill from 'quill';
import { Approach } from '@prisma/client';
import { Box } from '@mui/material';
import { Edit, Upload } from '@mui/icons-material';
import TitleEditor from '@/lib/components/TitleEditor';
import { useRouter } from 'next/navigation';
import { Delete } from '@mui/icons-material';
import Portal from '@/lib/components/Portal';
import DeleteModal from '@/lib/components/DeleteModal';
import FirebaseUserContext from '@/lib/context/FirebaseUserContext';
import { useContext } from 'react';
import Delta from 'quill-delta';
import DescriptionEditor from '@/lib/components/DescriptionEditor';
import CommonButton from '@/lib/components/common/CommonButton';
import DeviceTypeContext from '@/lib/context/DeviceTypeContext';

type Range = {
    index: number;
    length: number;
};

/**
 * 定石を更新
 * @param title タイトル
 * @param id 定石ID
 * @param quill Quillの参照
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

export default function ApproachEditForm({id}: {id: string}) {
    const router = useRouter();
    const [title, setTitle] = useState<string>('');
    const [, setApproach] = useState<Approach>();

    const descriptionRef = useRef<Quill | null>(null);
    const [, setRange] = useState<Range | null>(null);
    const [, setLastChange] = useState<Delta | null>(null);
    const [descriptionDelta, setDescriptionDelta] = useState<Delta>();

    const user = useContext(FirebaseUserContext);

    const [isLoading, setIsLoading] = useState(true);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const deviceType = useContext(DeviceTypeContext);

    // 編集前に以前の定石を取得
    useEffect(() => {
        async function fetchApproach() {
            if (!user) return;
            const approach = await getApproach(id, user.uid ?? '') as Approach;
            setApproach(approach);
            setTitle(approach.title);

            const quillModule = await import('quill');
            const Delta = quillModule.default.import('delta');
            const quill = new quillModule.default(document.createElement('div'));
            const descriptionDelta = quill.clipboard.convert({ html: approach.content });
            setDescriptionDelta(new Delta(descriptionDelta.ops));            
            setIsLoading(false);
        }
        fetchApproach();
    }, [user, id]);

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
        const approach = await send(title, id, descriptionRef);
        if (approach) {
            router.push(`/approaches/${approach.id}?edited=true`);
        }
    }

    // 削除確認ダイアログの開閉
    const toggleDeleteModal = () => {
        setIsDeleteModalOpen(!isDeleteModalOpen);
    };
    
    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <>
        <div id="delete_modal"></div>
        {isDeleteModalOpen && (
            <Portal element={document.getElementById("delete_modal")!}>
                <DeleteModal target="approach" id={id ?? 0} onButtonClick={toggleDeleteModal} />
            </Portal>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '1rem' }}>
            <h2>
                <Edit />
                <span>定石編集</span>
            </h2>
            <TitleEditor title={title} setTitle={setTitle} />

            <DescriptionEditor 
            defaultValue={descriptionDelta}
            containerRef={descriptionRef}
            onSelectionChange={setRange}
            onTextChange={setLastChange} />
        </Box>

        {deviceType === 'mobile' && (
        <Box sx={{ 
            paddingY: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '2rem',
            width: '100%'}}>
            <CommonButton color="secondary" onClick={handleSendButton} width='100%'>
                <Upload />
                <span>編集完了</span>
            </CommonButton>
            <CommonButton color="error" onClick={toggleDeleteModal} width='100%'>
                <Delete />
                <span>削除</span>
            </CommonButton>
        </Box>
        )}

        {deviceType === 'desktop' && (
        <Box sx={{ 
            paddingY: '0.5rem',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%'}}>
            <CommonButton color="error" onClick={toggleDeleteModal} width='45%'>
                <Delete />
                <span>削除</span>
            </CommonButton>
            <CommonButton color="secondary" onClick={handleSendButton} width='45%'>
                <Upload />
                <span>編集完了</span>
            </CommonButton>
        </Box>
        )}
        </>
    );
}