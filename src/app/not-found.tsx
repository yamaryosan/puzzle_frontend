"use client";

import Link from "next/link";
import CommonButton from "@/lib/components/common/CommonButton";
import { UndoOutlined } from "@mui/icons-material";

export default function NotFound() {
    return (
        <>
            <h2>404 Not Found</h2>
            <p>ページが見つかりません。</p>
            <Link href="/">
                <CommonButton color="primary" onClick={() => {}}>
                    <UndoOutlined />
                    <span>ホームへ</span>
                </CommonButton>
            </Link>
        </>
    );
}
