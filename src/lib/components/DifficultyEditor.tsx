import Rating from "@mui/material/Rating";
import Box from "@mui/material/Box";
import DeviceTypeContext from "@/lib/context/DeviceTypeContext";
import { useContext } from "react";

type DifficultyEditorProps = {
    value: number;
    onChange: (value: number) => void;
};

export default function DifficultEditor({
    value,
    onChange,
}: DifficultyEditorProps) {
    const deviceType = useContext(DeviceTypeContext);
    return (
        <>
            <Box sx={{ paddingY: "0.5rem", width: "100%" }}>
                <h3>難易度</h3>
                <Rating
                    name="difficulty"
                    value={value}
                    onChange={(_, newValue) => onChange(newValue ?? 1)}
                    sx={{ fontSize: deviceType === "mobile" ? "3rem" : "4rem" }}
                />
            </Box>
        </>
    );
}
