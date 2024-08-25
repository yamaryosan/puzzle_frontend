import Rating from '@mui/material/Rating';

type DifficultyViewerProps = {
    value: number;
};

export default function DifficultViewer({ value }: DifficultyViewerProps) {
    return (
        <>
        <p>難易度</p>
        <Rating name="difficulty" value={value} readOnly sx={{ fontSize: '2rem' }}/>
        </>
    );
}