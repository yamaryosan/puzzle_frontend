"use client";

import {
    StorageOutlined,
    CloudUploadOutlined,
    CloudDownloadOutlined,
} from "@mui/icons-material";
import CommonButton from "@/lib/components/common/CommonButton";
import { exportData, importData } from "@/lib/api/dataApi";
import { useContext, useState, useRef } from "react";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";

export default function Page() {
    const user = useContext(FirebaseUserContext);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) {
            setErrorMessage("ファイルが選択されていません");
            return;
        }
        if (!user?.uid) {
            setErrorMessage("ユーザIDが取得できません");
            return;
        }
        try {
            setIsImporting(true);
            await importData(user?.uid ?? "", file);
            setSuccessMessage("データのインポートに成功しました");
        } catch (error) {
            setErrorMessage("データのインポートに失敗しました");
        } finally {
            setIsImporting(false);
            // ファイル入力をクリア
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <>
            <h2
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
                <StorageOutlined />
                データ管理
            </h2>
            <CommonButton
                color="primary"
                onClick={() => {
                    exportData(user?.uid ?? "");
                }}
            >
                <CloudDownloadOutlined />
                データをダウンロード(エクスポート)
            </CommonButton>
            <input
                id="file-input-import"
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileChange}
                style={{ display: "none" }}
            />
            <label htmlFor="file-input-import">
                <CommonButton
                    color="secondary"
                    component="span"
                    onClick={() => {}}
                    disabled={isImporting}
                >
                    <CloudUploadOutlined />
                    データをアップロード(インポート)
                </CommonButton>
            </label>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            {successMessage && (
                <p style={{ color: "green" }}>{successMessage}</p>
            )}
        </>
    );
}
