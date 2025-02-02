"use client";

import Link from "next/link";
import { getApproaches } from "@/lib/api/approachApi";
import { useEffect, useState } from "react";
import { approaches } from "@prisma/client";
import { AddCircleOutline, QuizOutlined } from "@mui/icons-material";
import { useSearchParams } from "next/navigation";
import MessageModal from "@/lib/components/MessageModal";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { useContext } from "react";
import ApproachCards from "@/lib/components/ApproachCards";
import CommonButton from "@/lib/components/common/CommonButton";

export default function Approaches() {
    const user = useContext(FirebaseUserContext);
    const [approaches, setApproaches] = useState<approaches[]>([]);
    // アクティブなカードのID
    const [activeCardId, setActiveCardId] = useState<number | null>(null);

    const router = useSearchParams();
    const showDeletedModal = router.get("deleted") === "true";

    useEffect(() => {
        async function fetchApproaches() {
            if (!user) return;
            const approaches = await getApproaches(user.uid ?? "");
            setApproaches(approaches || []);
        }
        fetchApproaches();
    }, [user]);

    // カードのクリックイベント
    const handleCardClick = (id: number) => {
        setActiveCardId(id === activeCardId ? null : id);
    };

    return (
        <>
            {showDeletedModal && (
                <MessageModal message="定石を削除しました" param="deleted" />
            )}
            <h2
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
                <QuizOutlined />
                定石一覧
            </h2>

            <Link href="/approaches/create" style={{ display: "block" }}>
                <CommonButton onClick={() => {}} color="primary">
                    <AddCircleOutline />
                    <span>定石作成</span>
                </CommonButton>
            </Link>

            <ApproachCards
                approaches={approaches}
                activeCardId={activeCardId}
                handleCardClick={handleCardClick}
            />
        </>
    );
}
