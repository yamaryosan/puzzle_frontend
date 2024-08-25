import Rating from '@mui/material/Rating';

type DifficultyEditorProps = {
    value: number;
    onChange: (value: number) => void;
};

export default function DifficultEditor({ value, onChange }: DifficultyEditorProps) {
    return (
        <>
            <Rating name="difficulty" value={value} onChange={(_, newValue) => onChange(newValue ?? 1)} sx={{ fontSize: '4rem' }} />
        </>
    );
}