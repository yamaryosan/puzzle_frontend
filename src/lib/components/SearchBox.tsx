'use client';

import { Search } from "@mui/icons-material";
import { Button, Box } from "@mui/material";
import { useState, useEffect } from "react";
import { InputBase } from "@mui/material";
import { searchPuzzles } from "@/lib/api/puzzleapi";
import { Puzzle } from "@prisma/client";
import ResultSlider from "@/lib/components/ResultSlider";

export default function SearchBox() {
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState<Puzzle[]>([]);

    useEffect(() => {
        async function fetchPuzzles() {
            if (searchText.trim().length === 0) {
                setSearchResults([]);
                return;
            }
            try {
                const puzzles = await searchPuzzles(searchText) as Puzzle[];
                setSearchResults(puzzles);
            } catch (error) {
                console.error("検索に失敗: ", error);
            }
        }
        fetchPuzzles();
    }, [searchText]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    return (
        <>
        <Box sx={{ display: "flex", color: "black", position: "relative" }}>
            <InputBase type="text" placeholder="検索..." value={searchText} onChange={handleChange}
            sx={{ backgroundColor: "white", padding: "0.25rem", paddingLeft: "0.75rem", borderRadius: "5px", width: "300px" }}
            />
            <Button sx={{ color: "white", scale: "1.5" }}>
                <Search />
            </Button>
            <Box sx={{
                position: "absolute",
                backgroundColor: "white",
                top: "100%",
                left: "0",
                width: "300px" }}>
            <ResultSlider result={searchResults} />
            </Box>
        </Box>
        </>
    );
}