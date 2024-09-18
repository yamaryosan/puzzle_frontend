'use client';

import { Search } from "@mui/icons-material";
import { Button, Box } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { InputBase } from "@mui/material";
import { searchPuzzles } from "@/lib/api/puzzleapi";
import { Puzzle } from "@prisma/client";
import ResultSlider from "@/lib/components/ResultSlider";
import Link from "next/link";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { useContext } from "react";

export default function SearchBox() {
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState<Puzzle[]>([]);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const searchBoxRef = useRef<HTMLInputElement>(null);

    const user = useContext(FirebaseUserContext);

    useEffect(() => {
        async function fetchPuzzles() {
            if (!user) return;
            if (searchText.trim().length === 0) {
                setSearchResults([]);
                return;
            }
            try {
                const puzzles = await searchPuzzles(searchText, user.uid) as Puzzle[];
                setSearchResults(puzzles);
            } catch (error) {
                console.error("検索に失敗: ", error);
            }
        }
        fetchPuzzles();
    }, [searchText, user]);

    // フォーカスが外れたら0.2秒後に検索結果を非表示(検索結果をクリックできるようにするため)
    useEffect(() => {
        async function handleClickOutside(event: MouseEvent) {
            if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
                setTimeout(() => {
                    setIsInputFocused(false);
                }, 200);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    const handleFocus = () => {
        setIsInputFocused(true);
    }

    return (
        <>
        <Box sx={{ display: "flex", color: "black", position: "relative" }}>
            <InputBase type="text" placeholder="検索..." value={searchText} onChange={handleChange} onFocus={handleFocus} inputRef={searchBoxRef} disabled={!user}
            sx={{ backgroundColor: "white", padding: "0.25rem", paddingLeft: "0.75rem", borderRadius: "5px", width: "300px" }}
            />
            {searchText.trim().length > 0 ? (
                <Link href={`/search/${searchText}`}>
                    <Button sx={{ color: "white", scale: "1.5", marginLeft: "1rem" }}>
                        <Search />
                    </Button>
                </Link>
            ):(
                <Button sx={{ color: "white", scale: "1.5", marginLeft: "1rem" }} disabled>
                    <Search />
                </Button>
            )}

            {isInputFocused && (
                <Box sx={{
                    position: "absolute",
                    backgroundColor: "white",
                    top: "100%",
                    left: "0",
                    width: "300px" }}>
                    <ResultSlider result={searchResults} />
                </Box>
            )}
        </Box>
        </>
    );
}