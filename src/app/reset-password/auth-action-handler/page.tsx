'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const isEmulator = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR === "true";

export default function Page() {
    const router = useRouter();

    useEffect(() => {
        if (isEmulator) {
            router.push("/?passwordReset=true");
        }
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get("mode");
        const oobCode = urlParams.get("oobCode");

        if (mode !== "resetPassword" || !oobCode) {
            router.push("/");
        } else {
            router.push(`/reset-password/complete?oobCode=${oobCode}`);
        }
    }, [router]);

    return <p>リダイレクト中...</p>;
}