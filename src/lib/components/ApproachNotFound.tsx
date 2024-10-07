import Link from "next/link";
import CommonButton from "@/lib/components/common/CommonButton";
import { UndoOutlined } from "@mui/icons-material";

export default function ApproachNotFound() {
    return (
        <>
        <p>定石が見つかりません。</p>
        <Link href="/approaches">
            <CommonButton color="primary" onClick={() => {}}>
            <UndoOutlined />
            <span>定石一覧へ</span>
            </CommonButton>
        </Link>
        </>
    )
}