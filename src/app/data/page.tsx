"use client";

import { Button, Box } from "@mui/material";
import {
    StorageOutlined,
    CloudUploadOutlined,
    CloudDownloadOutlined,
} from "@mui/icons-material";
import CommonButton from "@/lib/components/common/CommonButton";

export default function Page() {
    return (
        <>
            <h2
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
                <StorageOutlined />
                データ管理
            </h2>
            <Box
                sx={{
                    display: "flex",
                    gap: "0.5rem",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <CommonButton color="primary" onClick={() => {}}>
                    <CloudDownloadOutlined />
                    データをダウンロード(エクスポート)
                </CommonButton>
                <CommonButton color="secondary" onClick={() => {}}>
                    <CloudUploadOutlined />
                    データをアップロード(インポート)
                </CommonButton>
            </Box>
        </>
    );
}
