import { Box } from "@mui/material";

type elementTypes = "text" | "password" | "email";

type Props = {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    elementId?: string;
    elementType?: elementTypes;
    placeholder?: string;
    disabled?: boolean;
};

export default function CommonInputText({ value, onChange, elementId, elementType, placeholder, disabled }: Props) {
    return (
        <Box
        sx={{
            input: {
                width: '100%',
                padding: '0.5rem',
                fontSize: '1rem',
                border: '1px solid #ccc',
                borderRadius: '0.25rem',
                ":disabled": {
                    backgroundColor: '#f0f0f0',
                },
            },
        }}
        >
            <input type={elementType} id={elementId} placeholder={placeholder} value={value} onChange={onChange} disabled={disabled}/>
        </Box>
    )
}