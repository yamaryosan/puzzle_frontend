import { Checkbox, FormControlLabel } from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";

type FavoriteButtonProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
};

export default function FavoriteButton({ checked, onChange }: FavoriteButtonProps) {
    return (
        <FormControlLabel
            control={
                <Checkbox
                icon={<FavoriteBorder sx={{ color: "grey.300" }}/>}
                checkedIcon={<Favorite />}
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                name="favorite"
                color="error"
                size="large"
                />
            }
            label={checked ? '解除' : '登録'}
        />
      );
}