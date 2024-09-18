'use client';

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { useContext } from "react";

export default function AuthGuardLayout({ children }: Readonly<{ children: ReactNode; }>) {
    const pathname = usePathname();
    const user = useContext(FirebaseUserContext);

    // ユーザーがサインインしているかどうか
    const isUserSignedIn = user !== null;
    // URLパスがパブリックな(サインイン不要な)ページかどうか
    const isPublicPage = () => {
        const publicPages = [
            "/",
            "/signin",
            "/signup",
            "/signout",
            "/reset-password",
            "/complete-registration",
            "/about",
            "/terms",
        ];
        return publicPages.includes(pathname);
    };

    // サインインしていない場合はサインインページにリダイレクト
    if (!isUserSignedIn && !isPublicPage()) {
        return (
            <div>
                サインインしてください。
            </div>
        );
    }

    // サインインしている場合は子コンポーネントを表示
    return <>{children}</>;
}