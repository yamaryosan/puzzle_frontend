import { useEffect, useState } from "react";
import { getApproaches } from "../api/approachApi";
import { Approach } from "@prisma/client";
import { getApproachesByPuzzleId } from '@/lib/api/approachApi';

/**
 * 定石一覧を取得
 * @params void
 * @returns Promise<Approach[]>
 */
async function fetch() {
    const approaches = await getApproaches();
    return approaches as Approach[];
}

type ApproachWithRelation = {
    id: number;
    puzzle_id: number;
    approach_id: number;
    approach: Approach;
};

interface ApproachCheckboxProps {
    onChange: (approachIds: number[]) => void;
    puzzle_id: string;
    value: number[];
}

export default function ApproachCheckbox({ onChange, puzzle_id, value }: ApproachCheckboxProps) {
    const [approaches, setApproaches] = useState<Approach[] | null>(null);
    const [checkedApproachIds, setCheckedApproachIds] = useState<number[]>(value);

    // 編集前に定石を取得
    useEffect(() => {
        async function fetchInitialApproaches(id: string): Promise<ApproachWithRelation[] | undefined> {
            return getApproachesByPuzzleId(id);
        }
        fetchInitialApproaches(puzzle_id).then((approaches) => {
            if (!approaches) {
                return;
            }
            const initialApproachIds = approaches.map((a) => a.approach_id);
            console.log("定石を取得しました: ", initialApproachIds);
            setCheckedApproachIds(initialApproachIds);
        });
    }, []); 

    // 定石一覧を取得
    async function fetchApproaches() {
        try {
            const approaches = await fetch();
            setApproaches(approaches);
            return approaches;
        } catch (error) {
            console.error("定石の取得に失敗: ", error);
            return null;
        }
    }

    useEffect(() => {
        fetchApproaches();
    }, []);

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
        <div>
            <h1>定石</h1>
            {approaches?.length === 0 && <p>定石がありません</p>}
            {approaches?.map((approach) => (
                <div key={approach.id}>
                    <input
                        type="checkbox"
                        id={approach.id.toString()}
                        checked={checkedApproachIds.includes(approach.id)}
                        onChange={() => handleCheckboxChange(approach.id)}
                    />
                    <label htmlFor={approach.id.toString()}>{approach.title}</label>
                </div>
            ))}
        </div>
    );
}