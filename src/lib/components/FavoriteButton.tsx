import { Checkbox, FormControlLabel } from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { toggleFavoritePuzzle } from "@/lib/api/puzzleapi";

type FavoriteButtonProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    puzzleId: string;
};

export default function FavoriteButton({ checked, onChange, puzzleId }: FavoriteButtonProps) {
    const handleChange = async (checked: boolean) => {
        await toggleFavoritePuzzle(puzzleId);
        onChange(checked);
    };

    return (
        <FormControlLabel
            control={
                <Checkbox
                icon={<FavoriteBorder sx={{ color: "grey.300" }}/>}
                checkedIcon={<Favorite />}
                checked={checked}
                onChange={(e) => handleChange(e.target.checked)}
                name="favorite"
                color="error"
                size="large"
                />
            }
            label={checked ? '解除' : '登録'}
        />
      );
}