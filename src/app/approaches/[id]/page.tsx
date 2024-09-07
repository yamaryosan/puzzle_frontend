'use client';

import Link from 'next/link';
import { getApproach, getPuzzlesByApproachId } from '@/lib/api/approachApi';
import { useEffect, useState } from 'react';
import { Approach, Puzzle } from '@prisma/client';
import Viewer from '@/lib/components/Viewer';
import useAuth from '@/lib/hooks/useAuth';
import RecommendSignInDialog from '@/lib/components/RecommendSignInDialog';
import { useSearchParams } from 'next/navigation';
import MessageModal from '@/lib/components/MessageModal';
import { Button, Box } from '@mui/material';
import { Edit, Delete, Clear } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import DeleteModal from '@/lib/components/DeleteModal';

type PageParams = {
    id: string;
};

export default function Page({ params }: { params: PageParams }) {
    const { user, userId } = useAuth();
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
            const approach = await getApproach(params.id, userId ?? '');
            if (!approach) {
                return;
            }
            setApproach(approach);
        }
        fetchApproach();
    }, [userId]);

    // 定石に紐づく問題情報を取得
    useEffect(() => {
        async function fetchPuzzles() {
            const puzzles = await getPuzzlesByApproachId(params.id, userId ?? '');
            if (!puzzles) {
                return;
            }
            setPuzzles(puzzles);
        }
        fetchPuzzles();
    }, [userId]);

    // 定石編集画面へ遷移
    const handleSendButton = () => {
        router.push(`/approaches/${params.id}/edit`);
    };

    // 削除確認モーダルの表示切り替え
    const toggleDeleteModal = () => {
        setIsDeleteModalOpen(!isDeleteModalOpen);
    };

    if (!user) {
        return <RecommendSignInDialog />;
    }

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
            <DeleteModal target="approach" id={params.id} onButtonClick={toggleDeleteModal} />
        )}
        <div>
            <h2>{approach.title}</h2>
            <Viewer defaultValue={approach.content ?? ''} />
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
            <Button 
            sx={{
                padding: '1.5rem',
                backgroundColor: 'secondary.light',
                width: '20%',
                ":hover": {
                    backgroundColor: 'secondary.main',
                }
            }}
            onClick={handleSendButton}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', scale: "1.8", color: "black" }}>
                    <Edit />
                    <span>編集</span>
                </Box>
            </Button>
            <Button
            sx={{
                padding: '1.5rem',
                backgroundColor: 'error.light',
                width: '20%',
                ":hover": {
                    backgroundColor: 'error.main',
                },
            }}
            onClick={toggleDeleteModal}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', scale: "1.4", color: "black" }}>
                    {isDeleteModalOpen ? <Clear /> : <Delete />}
                </Box>
            </Button>
        </Box>
        </div>
        </>
    );
}