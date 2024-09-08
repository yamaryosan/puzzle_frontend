import { Button } from "@mui/material";

type color = "primary" | "secondary" | "error";

type CommonButtonProps = {
    children: React.ReactNode;
    color: color;
    onClick: () => void;
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
            {children}
        </Button>
    );
}