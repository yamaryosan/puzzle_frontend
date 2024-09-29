import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { Box, TextField, Button } from "@mui/material";
import { Search } from "@mui/icons-material";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { Puzzle } from "@prisma/client";
import { searchPuzzles } from "@/lib/api/puzzleapi";
import { List, ListItem, ListItemText } from "@mui/material";
import Link from "next/link";

type props = {
    onClose: () => void;
};

/**
 * モバイル用の検索結果リスト
 * @param onClose ドロワーを閉じる関数
 */
export default function MobileSearchResultsList({ onClose }: props) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Puzzle[]>([]);

    const user = useContext(FirebaseUserContext);
    const router = useRouter();

    useEffect(() => {
        async function fetchPuzzles() {
            if (!user) return;
            if (searchQuery.trim().length === 0) {
                setSearchResults([]);
                return;
            }
            try {
                const puzzles = await searchPuzzles(searchQuery, user.uid) as Puzzle[];
                setSearchResults(puzzles);
            } catch (error) {
                console.error("検索に失敗: ", error);
            }
        }
        fetchPuzzles();
    }, [searchQuery, user]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchQuery("");
        onClose();
        router.push(`/search?q=${searchQuery}`);
    };

    const handleClickPuzzleLink = () => {
        setSearchQuery("");
        onClose();
    }

    return (
        <Box sx={{
            padding: '0.5rem',
        }}>
            <form onSubmit={handleSearch}>
                <TextField
                    label="検索"
                    variant="outlined"
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}/>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}
                    sx={{ marginTop: '1rem', width: "100%", height: "3rem" }}>
                    <Search />
                </Button>
                <Box sx={{
                    backgroundColor: "white",
                    top: "100%",
                    left: "0",
                    width: "100%" }}>
                    <p>
                        {searchResults.length === 0 ? "検索結果はありません" : `${searchResults.length}件の検索結果`}
                    </p>
                    <List>
                        {searchResults?.slice(0, 5).map((puzzle) => (
                            <ListItem
                                key={puzzle.id}
                                component={Link}
                                onClick={handleClickPuzzleLink}
                                href={`/puzzles/${puzzle.id}`}
                                sx={{
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    borderBottom: '1px solid #e0e0e0',
                                    '&:active': {
                                    backgroundColor: 'primary.light',
                                    },
                                }}>
                                <ListItemText primary={puzzle.title} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </form>
        </Box>
    );
}