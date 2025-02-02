import { Card } from "@mui/material";
import ApproachInfo from "@/lib/components/ApproachInfo";
import { approaches } from "@prisma/client";

type ApproachCardProps = {
    approach: approaches;
    isActive: boolean;
    onClick: () => void;
};

export default function ApproachCard({
    approach,
    isActive,
    onClick,
}: ApproachCardProps) {
    return (
        <Card
            variant="outlined"
            sx={{
                marginY: 1,
                padding: "1rem",
                cursor: "pointer",
                backgroundColor: isActive ? "#f0f0f0" : "white",
            }}
            onClick={onClick}
        >
            <ApproachInfo approach={approach} isActive={isActive} />
        </Card>
    );
}
