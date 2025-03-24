import Rating from "@mui/material/Rating";

type DifficultyViewerProps = {
    value: number;
};

export default function DifficultViewer({ value }: DifficultyViewerProps) {
    return (
        <>
            <Rating
                name="difficulty"
                value={value}
                readOnly
                sx={{ fontSize: "2rem" }}
            />
        </>
    );
}
