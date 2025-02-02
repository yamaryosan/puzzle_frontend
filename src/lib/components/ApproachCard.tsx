import { Card } from "@mui/material";
import ApproachInfo from "@/lib/components/ApproachInfo";
import { Approach } from "@prisma/client";

type ApproachCardProps = {
    approach: Approach;
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
