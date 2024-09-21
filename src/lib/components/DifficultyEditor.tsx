import Rating from '@mui/material/Rating';
import Box from '@mui/material/Box';

type DifficultyEditorProps = {
    value: number;
    onChange: (value: number) => void;
};

export default function DifficultEditor({ value, onChange }: DifficultyEditorProps) {
    return (
        <>
        <Box sx={{ paddingY: '0.5rem' }}>
            <h3>難易度</h3>
            <Rating name="difficulty" value={value} onChange={(_, newValue) => onChange(newValue ?? 1)} sx={{ fontSize: '4rem' }} />
        </Box>
        </>
    );
}