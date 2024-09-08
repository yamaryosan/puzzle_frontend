import { Box } from "@mui/material";

type elementTypes = "text" | "password" | "email";

type Props = {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    elementId?: string;
    elementType?: elementTypes;
    placeholder?: string;
};

export default function CommonInputText({ value, onChange, elementId, elementType, placeholder }: Props) {
    return (
        <Box
        sx={{
            input: {
                width: '100%',
                padding: '0.5rem',
                fontSize: '1rem',
                border: '1px solid #ccc',
                borderRadius: '0.25rem',
            },
        }}
        >
            <input type={elementType} id={elementId} placeholder={placeholder} value={value} onChange={onChange} required/>
        </Box>
    )
}