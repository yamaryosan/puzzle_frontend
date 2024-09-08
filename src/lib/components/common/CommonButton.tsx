import { Button, Box } from "@mui/material";

type color = "primary" | "secondary" | "error";

type CommonButtonProps = {
    children: React.ReactNode;
    color: color;
    onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    disabled?: boolean;
};

export default function CommonButton({ children, color, onClick, disabled }: CommonButtonProps) {
    return (
        <Button 
        sx={{
            padding: '1.5rem',
            backgroundColor: `${color}.light`,
            width: '100%',
            ":hover": {
                backgroundColor: `${color}.main`,
            },
            ":disabled": {
                backgroundColor: `${color}.dark`,
            }
        }}
        onClick={onClick}
        disabled={disabled}>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: "center", gap: '0.5rem', scale: "1.8", color: "black" }}>
                {children}
            </Box>
        </Button>
    );
}