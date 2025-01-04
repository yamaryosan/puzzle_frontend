"use client";

import { Box } from "@mui/material";
import {
    StorageOutlined,
    CloudUploadOutlined,
    CloudDownloadOutlined,
} from "@mui/icons-material";
import CommonButton from "@/lib/components/common/CommonButton";

import { exportData } from "@/lib/api/dataApi";
import { useContext } from "react";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";

export default function Page() {
    const user = useContext(FirebaseUserContext);

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
                <CommonButton
                    color="primary"
                    onClick={() => {
                        exportData(user?.uid ?? "");
                    }}
                >
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
