import { useState } from "react";
import { Box, Tabs, Tab, Button } from "@mui/material";
import TabPanel from "@/lib/components/TabPanel";
import Viewer from "@/lib/components/Viewer";
import getHintsByPuzzleId from "@/lib/api/hintapi";
import { hints } from "@prisma/client";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { useContext, useEffect } from "react";

type HintsViewerProps = {
    puzzleId: string;
};

/**
 * 複数ヒントのビューワー
 * @returns
 */
export default function HintsViewer({ puzzleId }: HintsViewerProps) {
    const [hints, setHints] = useState<hints[] | null>(null);
    const [value, setValue] = useState(0);
    const [show, setShow] = useState(false);

    const user = useContext(FirebaseUserContext);

    // ヒントを取得
    useEffect(() => {
        async function fetchHints() {
            if (!user) return;
            const hints = (await getHintsByPuzzleId(
                puzzleId,
                user.uid
            )) as hints[];
            setHints(hints);
        }
        fetchHints();
    }, [user, puzzleId]);

    // タブの変更
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    // 表示・非表示の切り替え
    const handleToggle = () => {
        setShow(!show);
    };

    return (
        <>
            <Box sx={{ paddingY: "0.5rem" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <h4>ヒント</h4>
                    <Button onClick={handleToggle} sx={{ marginLeft: "1rem" }}>
                        {show ? "非表示" : "表示"}
                    </Button>
                </Box>
                {show && (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            width: "100%",
                        }}
                    >
                        <Tabs
                            orientation="horizontal"
                            variant="scrollable"
                            value={value}
                            onChange={handleChange}
                            sx={{
                                // タブのスタイル
                                "& .MuiTab-root": {
                                    flex: 1, // タブの幅を均等にする
                                    maxWidth: "none",
                                    color: "grey.300",
                                    fontSize: "1.2rem",
                                    // 非選択時の下線
                                    "&::before": {
                                        content: '""',
                                        position: "absolute",
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        height: "4px",
                                        backgroundColor: "grey.300",
                                        transition: "background-color 0.3s",
                                    },
                                },
                                // タブ選択時のスタイル
                                "& .Mui-selected": {
                                    color: "primary.main",
                                    fontWeight: "bold",
                                    backgroundColor: "grey.200",
                                    // 選択時の下線
                                    "&::before": {
                                        backgroundColor: "primary.main",
                                    },
                                },
                            }}
                        >
                            {hints?.map((hint, index) => (
                                <Tab label={`ヒント${index + 1}`} key={index} />
                            ))}
                        </Tabs>
                        {hints?.map((hint, index) => (
                            <TabPanel value={value} index={index} key={index}>
                                <Viewer html={hint.content} />
                            </TabPanel>
                        ))}
                    </Box>
                )}
            </Box>
        </>
    );
}
