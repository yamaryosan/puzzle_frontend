import { approaches } from "@prisma/client";
import ApproachCard from "@/lib/components/ApproachCard";

type ApproachCardsProps = {
    approaches: approaches[];
    activeCardId: number | null;
    handleCardClick: (id: number) => void;
};

export default function ApproachCards({
    approaches,
    activeCardId,
    handleCardClick,
}: ApproachCardsProps) {
    return (
        <>
            <ul>
                {approaches.map((approach) => (
                    <ApproachCard
                        key={approach.id}
                        approach={approach}
                        isActive={approach.id === activeCardId}
                        onClick={() => handleCardClick(approach.id)}
                    />
                ))}
            </ul>
            {approaches.length === 0 && <p>最初の定石を作成しましょう！</p>}
        </>
    );
}
