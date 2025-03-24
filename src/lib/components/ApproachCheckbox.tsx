import { useEffect, useState } from "react";
import { getApproaches } from "../api/approachApi";
import { approaches } from "@prisma/client";
import { getApproachesByPuzzleId } from "@/lib/api/approachApi";
import { Box } from "@mui/material";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { useContext } from "react";
import Checkbox from "@mui/material/Checkbox";
import DeviceTypeContext from "@/lib/context/DeviceTypeContext";

interface ApproachCheckboxProps {
    onChange: (approachIds: number[]) => void;
    puzzle_id: string;
    value: number[];
}

export default function ApproachCheckbox({
    onChange,
    puzzle_id,
    value,
}: ApproachCheckboxProps) {
    const user = useContext(FirebaseUserContext);
    const [approaches, setApproaches] = useState<approaches[] | null>(null);
    const [checkedApproachIds, setCheckedApproachIds] =
        useState<number[]>(value);

    const deviceType = useContext(DeviceTypeContext);

    // 編集前に定石を取得
    useEffect(() => {
        async function fetchApproachesByPuzzleId() {
            try {
                if (!user) return;
                const approaches = await getApproachesByPuzzleId(
                    puzzle_id,
                    user.uid ?? ""
                );
                if (!approaches) return;
                setCheckedApproachIds(
                    approaches.map((approach) => approach.id)
                );
            } catch (error) {
                console.error("定石の取得に失敗: ", error);
            }
        }
        fetchApproachesByPuzzleId();
    }, [puzzle_id, user]);

    useEffect(() => {
        // 定石一覧を取得
        async function fetchApproaches() {
            try {
                if (!user) return;
                const approaches = await getApproaches(user.uid ?? "");
                setApproaches(approaches || []);
                return approaches;
            } catch (error) {
                console.error("定石の取得に失敗: ", error);
                return null;
            }
        }
        fetchApproaches();
    }, [user]);

    // チェックされた定石のIDを親コンポーネントに渡す
    useEffect(() => {
        onChange(checkedApproachIds);
    }, [checkedApproachIds, onChange]);

    // チェックボックスの状態を変更(チェックされている場合は削除、チェックされていない場合は追加)
    const handleCheckboxChange = (categoryId: number) => {
        setCheckedApproachIds((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    return (
        <Box sx={{ paddingY: "0.5rem" }}>
            <h3>定石</h3>
            <Box
                sx={{
                    padding: "1rem",
                    border: "1px solid #ccc",
                    borderRadius: "0.25rem",
                    fontSize: `${deviceType === "mobile" ? "1rem" : "1.5rem"}`,
                }}
            >
                {approaches?.length === 0 && <p>定石がありません</p>}
                <Box
                    sx={{
                        display: "grid",
                        gap: "1rem",
                        gridTemplateColumns: `${deviceType === "mobile" ? "1fr" : "1fr 1fr"}`,
                    }}
                >
                    {approaches?.map((approach) => (
                        <div key={approach.id}>
                            <Checkbox
                                checked={checkedApproachIds.includes(
                                    approach.id
                                )}
                                id={`approach_${approach.id.toString()}`}
                                onChange={() =>
                                    handleCheckboxChange(approach.id)
                                }
                                size={
                                    deviceType === "mobile" ? "large" : "medium"
                                }
                                sx={{
                                    color: "primary.main",
                                    "&.Mui-checked": {
                                        color: "primary.main",
                                    },
                                }}
                            />
                            <label
                                htmlFor={`approach_${approach.id.toString()}`}
                            >
                                {approach.title}
                            </label>
                        </div>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
