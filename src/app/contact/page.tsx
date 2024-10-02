'use client';

import { Button, Paper, TextareaAutosize } from "@mui/material";
import { MailOutline } from "@mui/icons-material";
import { Box, Input } from "@mui/material";
import { useContext, useState } from "react";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import sendEmail from "@/lib/api/send-email";
import { ErrorOutline, ThumbUpAltOutlined } from "@mui/icons-material";

export default function Page() {
    const user = useContext(FirebaseUserContext);
    const [username, setUsername] = useState<string>(user?.displayName ?? "");
    const [email, setEmail] = useState<string>(user?.email ?? "");
    const [content, setContent] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if (!username || !email || !content) {
            setError("未入力の項目があります");
            return;
        }
        try {
            setIsButtonDisabled(true);
            await sendEmail(username, email, content);
            setUsername("");
            setEmail("");
            setContent("");
            setMessage("お問い合わせを受け付けました");
            setError("");
        } catch (error) {
            setError("お問い合わせの送信に失敗しました");
            console.error(error);
        }
    }

    return (
        <div>
        <h2 style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
            <MailOutline />
            お問い合わせ
        </h2>
            <Paper sx={{padding: "1rem", margin: "1rem"}}>
                <Box component="form">
                    <Box sx={{display: "flex", flexDirection: "column", gap: "0.5rem"}}>
                        <label>お名前</label>
                        <Input type="text" value={username} placeholder="お名前" onChange={(e) => setUsername(e.target.value)} />
                    </Box>
                    <Box sx={{display: "flex", flexDirection: "column", gap: "0.5rem"}}>
                        <label>メールアドレス</label>
                        <Input type="email" value={email} placeholder="メールアドレス" onChange={(e) => setEmail(e.target.value)} />
                    </Box>
                    <Box sx={{display: "flex", flexDirection: "column", gap: "0.5rem"}}>
                        <label>お問い合わせ内容</label>
                        <TextareaAutosize value={content} placeholder="内容" onChange={(e) => setContent(e.target.value)} />
                    </Box>
                    {error && (
                    <Box sx={{ color: "error.main", display: "flex", gap: "0.5rem", alignItems: "center"}}>
                        <ErrorOutline />
                        {error}
                    </Box>
                    )}
                    {message && (
                        <Box sx={{ color: "success.main", display: "flex", gap: "0.5rem", alignItems: "center"}}>
                            <ThumbUpAltOutlined />
                            {message}
                        </Box>
                    )}
                    <Box>
                        <Button
                        variant="contained"
                        color="primary"
                        sx={{ width: "100%", fontSize: "1.4rem", marginTop: "1rem" }}
                        disabled={isButtonDisabled}
                        onClick={handleSubmit}>送信</Button>
                    </Box>
                </Box>
            </Paper>
        </div>
    );
}