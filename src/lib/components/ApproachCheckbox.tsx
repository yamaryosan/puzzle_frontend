import { useEffect, useState } from "react";
import { getApproaches } from "../api/approachApi";
import { Approach } from "@prisma/client";
import { getApproachesByPuzzleId } from '@/lib/api/approachApi';
import { Box } from "@mui/material";
import FirebaseUserContext from '@/lib/context/FirebaseUserContext';
import { useContext } from "react";

interface ApproachCheckboxProps {
    onChange: (approachIds: number[]) => void;
    puzzle_id: string;
    value: number[];
}

export default function ApproachCheckbox({ onChange, puzzle_id, value }: ApproachCheckboxProps) {
    const user = useContext(FirebaseUserContext);
    const [approaches, setApproaches] = useState<Approach[] | null>(null);
    const [checkedApproachIds, setCheckedApproachIds] = useState<number[]>(value);

    // 編集前に定石を取得
    useEffect(() => {
        async function fetchInitialApproaches(id: string): Promise<Approach[] | undefined> {
            return getApproachesByPuzzleId(id);
        }
        fetchInitialApproaches(puzzle_id).then((approaches) => {
            if (!approaches) {
                return;
            }
            const initialApproachIds = approaches.map(approach => approach.id);
            console.log("定石を取得しました: ", initialApproachIds);
            setCheckedApproachIds(initialApproachIds);
        });
    }, []);

    // 定石一覧を取得
    async function fetchApproaches() {
        try {
            if (!user) return;
            const approaches = await getApproaches(user.uid ?? '');
            setApproaches(approaches || []);
            return approaches;
        } catch (error) {
            console.error("定石の取得に失敗: ", error);
            return null;
        }
    }

    useEffect(() => {
        fetchApproaches();
    }, [user]);

    // チェックされた定石のIDを親コンポーネントに渡す
    useEffect(() => {
        onChange(checkedApproachIds);
    }, [checkedApproachIds, onChange]);

    // チェックボックスの状態を変更(チェックされている場合は削除、チェックされていない場合は追加)
    const handleCheckboxChange = (categoryId: number) => {
        setCheckedApproachIds(prev => 
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    }

    return (
        <Box sx={{ paddingY: '0.5rem' }}>
            <h3>定石</h3>
            <Box sx={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "0.25rem", fontSize: "1.5rem" }}>
                {approaches?.length === 0 && <p>定石がありません</p>}
                <Box sx={{ display: "grid", gap: "1rem", gridTemplateColumns: "2fr 2fr" }}>
                {approaches?.map((approach) => (
                    <div key={approach.id}>
                        <input
                            type="checkbox"
                            id={`approach_${approach.id.toString()}`}
                            checked={checkedApproachIds.includes(approach.id)}
                            onChange={() => handleCheckboxChange(approach.id)}
                        />
                        <label htmlFor={`approach_${approach.id.toString()}`}>{approach.title}</label>
                    </div>
                ))}
                </Box>
            </Box>
        </Box>
    );
}