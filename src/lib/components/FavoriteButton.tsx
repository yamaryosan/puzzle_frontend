import { Checkbox, FormControlLabel } from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { toggleFavoritePuzzle } from "@/lib/api/puzzleapi";
import { useState } from "react";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { useContext } from "react";

type FavoriteButtonProps = {
    initialChecked: boolean;
    onChange: (checked: boolean) => void;
    puzzleId: string;
};

export default function FavoriteButton({ initialChecked, onChange, puzzleId }: FavoriteButtonProps) {
    const [checked, setChecked] = useState(initialChecked);
    const user = useContext(FirebaseUserContext);

    const handleChange = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return;
        const newChecked = !checked;
        setChecked(newChecked);
        await toggleFavoritePuzzle(puzzleId, user.uid);
        onChange(checked);
    };

    return (
        <FormControlLabel
            control={
                <Checkbox
                icon={<FavoriteBorder sx={{ color: "grey.300" }}/>}
                checkedIcon={<Favorite />}
                checked={checked}
                onClick={handleChange}
                name="favorite"
                color="error"
                size="large"
                />
            }
            label={checked ? '解除' : '登録'}
        />
      );
}