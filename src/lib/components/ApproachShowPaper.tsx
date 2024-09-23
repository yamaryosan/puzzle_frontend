'use client';

import Link from 'next/link';
import { getApproach, getPuzzlesByApproachId } from '@/lib/api/approachApi';
import { useEffect, useState } from 'react';
import { Approach, Puzzle } from '@prisma/client';
import Viewer from '@/lib/components/Viewer';
import { useSearchParams } from 'next/navigation';
import MessageModal from '@/lib/components/MessageModal';
import { Box } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import DeleteModal from '@/lib/components/DeleteModal';
import FirebaseUserContext from '@/lib/context/FirebaseUserContext';
import { useContext } from 'react';
import CommonButton from '@/lib/components/common/CommonButton';
import DescriptionViewer from '@/lib/components/DescriptionViewer';

export default function ApproachShowPaper({ id }: { id: string }) {
    const user = useContext(FirebaseUserContext);
    const [approach, setApproach] = useState<Approach | null>(null);
    const [puzzles, setPuzzles] = useState<Puzzle[] | null>(null);

    const searchParams = useSearchParams();
    const showCreatedModal = searchParams.get('created') === 'true';
    const showEditedModal = searchParams.get('edited') === 'true';

    const router = useRouter();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // 定石情報を取得
    useEffect(() => {
        async function fetchApproach() {
            if (!user) return;
            const approach = await getApproach(id, user.uid ?? '');
            if (!approach) {
                return;
            }
            setApproach(approach);
        }
        fetchApproach();
    }, [user]);

    // 定石に紐づく問題情報を取得
    useEffect(() => {
        async function fetchPuzzles() {
            if (!user) return;
            const puzzles = await getPuzzlesByApproachId(id, user.uid ?? '');
            if (!puzzles) {
                return;
            }
            setPuzzles(puzzles);
        }
        fetchPuzzles();
    }, [user]);

    // 定石編集画面へ遷移
    const handleSendButton = () => {
        router.push(`/approaches/${id}/edit`);
    };

    // 削除確認モーダルの表示切り替え
    const toggleDeleteModal = () => {
        setIsDeleteModalOpen(!isDeleteModalOpen);
    };

    if (!approach) {
        return <div>定石が見つかりません</div>;
    }

    return (
        <>
        {showCreatedModal && (
            <MessageModal message="定石を作成しました" param="created" />
        )}
        {showEditedModal && (
            <MessageModal message="定石を編集しました" param="edited" />
        )}
        {isDeleteModalOpen && (
            <DeleteModal target="approach" id={id} onButtonClick={toggleDeleteModal} />
        )}
        <div>
            <h2>{approach.title}</h2>

            <DescriptionViewer descriptionHtml={approach.content} />
            
            {puzzles?.length === 0 ? <p>この定石に紐づくパズルはありません</p> : ( 
            <div>
                <p>この定石に紐づくパズル</p>
                <ul>
                    {puzzles?.map((puzzle) => (
                        <li key={puzzle.id}>
                            <Link href={`/puzzles/${puzzle.id}`}>{puzzle.title}</Link>
                        </li>
                    ))}
                </ul>
            </div>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', paddingY: '1rem', marginY: '1rem' }}>
                <CommonButton color="secondary" onClick={handleSendButton} width="20%">
                    <Edit />
                    <span>編集</span>
                </CommonButton>
                <CommonButton color="error" onClick={toggleDeleteModal} width="20%">
                    <Delete />
                    <span>削除</span>
                </CommonButton>
            </Box>
        </div>
        </>
    );
}