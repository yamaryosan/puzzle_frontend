import { CheckCircleOutline } from "@mui/icons-material";

type CompletionStatusIconProps = {
    isSolved: boolean;
}

export default function CompletionStatusIcon({ isSolved }: CompletionStatusIconProps) {
    return (
        <div>
            {isSolved ? (
                <>
                <CheckCircleOutline color="success" />
                <span style={{color: "success.main"}}>解決済み</span>
                </>
            ) : (
                <>
                <CheckCircleOutline color="disabled" />
                <span style={{color: "disabled.main"}}>未解決</span>
                </>
            )}
        </div>
    );
}