import { Box, Button, Card } from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";
import Link from "next/link";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { useContext } from "react";
import DeviceTypeContext from "@/lib/context/DeviceTypeContext";

export default function RecommendSignInDialog() {
    const user = useContext(FirebaseUserContext);
    const deviceType = useContext(DeviceTypeContext);

    if (user) {
        return null;
    }

    return (
        <>
            <Box
                sx={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 1,
                    cursor: "pointer",
                    display: "block",
                }}
            />
            <Card
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 2,
                    padding: "1rem",
                    width: deviceType === "mobile" ? "90%" : "50%",
                    display: "block",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}
                >
                    <ErrorOutline sx={{ fontSize: "1.5rem" }} />
                    <h3>お知らせ</h3>
                </Box>
                <p style={{ fontSize: "1rem" }}>
                    ユーザ登録して、パズルを楽しもう！
                </p>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        marginTop: "1rem",
                        width: "100%",
                        fontSize: "1.5rem",
                    }}
                >
                    <Link href="/signup">登録</Link>
                </Button>
                <Box sx={{ height: "1rem" }} />
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <p style={{ fontSize: "1.0rem" }}>
                        アカウントをお持ちの方は
                        <Box
                            component="span"
                            sx={{ color: "primary.main", cursor: "pointer" }}
                        >
                            <Link href="/signin">ログイン</Link>
                        </Box>
                    </p>
                </Box>
            </Card>
        </>
    );
}
