"use client";

import { puzzles } from "@prisma/client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MessageModal from "@/lib/components/MessageModal";
import Puzzles from "@/lib/components/Puzzles";

type Puzzles = puzzles[];

function SearchParamsWrapper() {
    const searchParams = useSearchParams();
    const passwordReset = searchParams.get("passwordReset") === "true";
    const userCreated = searchParams.get("userCreated") === "true";
    const deleted = searchParams.get("deleted") === "true";
    const allDataDeleted = searchParams.get("allDataDeleted") === "true";
    return (
        <>
            {passwordReset && (
                <MessageModal
                    message="パスワードのリセットが完了しました。"
                    param="passwordReset"
                />
            )}
            {userCreated && (
                <MessageModal
                    message="ユーザー登録が完了しました。"
                    param="userCreated"
                />
            )}
            {deleted && (
                <MessageModal message="パズルを削除しました" param="deleted" />
            )}
            {allDataDeleted && (
                <MessageModal
                    message="データを削除しました"
                    param="allDataDeleted"
                />
            )}
        </>
    );
}

export default function Page() {
    return (
        <div>
            <Suspense fallback={null}>
                <SearchParamsWrapper />
            </Suspense>
            <Puzzles />
        </div>
    );
}
