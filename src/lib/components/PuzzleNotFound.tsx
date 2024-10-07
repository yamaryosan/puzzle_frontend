import Link from "next/link";
import CommonButton from "@/lib/components/common/CommonButton";
import { UndoOutlined } from "@mui/icons-material";

export default function PuzzleNotFound() {
    return (
        <>
        <p>パズルが見つかりません。</p>
        <Link href="/puzzles">
            <CommonButton color="primary" onClick={() => {}}>
            <UndoOutlined />
            <span>パズル一覧へ</span>
            </CommonButton>
        </Link>
        </>
    )
}