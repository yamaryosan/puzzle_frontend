import { Box } from "@mui/material";

type TitleEditorProps = {
    title: string;
    setTitle: (title: string) => void;
};

export default function TitleEditor({ title, setTitle }: TitleEditorProps) {
    return (
        <Box
        sx={{
            paddingY: '0.5rem',
            input: {
                width: '100%',
                padding: '0.5rem',
                fontSize: '1rem',
                border: '1px solid #ccc',
                borderRadius: '0.25rem',
            },
        }}
        >
            <h3>タイトル</h3>
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required/>
        </Box>
    )
}