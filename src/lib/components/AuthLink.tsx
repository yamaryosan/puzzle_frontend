"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FirebaseUserContext from "@/lib/context/FirebaseUserContext";
import { useContext } from "react";

interface AuthLinkProps {
    href: string;
    children: ReactNode;
    fallbackHref: string;
}

/**
 * ユーザーがログインしている場合は指定されたリンクに遷移し、
 * ログインしていない場合は指定されたリンクに遷移
 * @param href リンク先のURL
 * @param children リンクの中身
 * @param fallbackHref ログインしていない場合のリンク先のURL
 */
export default function AuthLink({
    href,
    children,
    fallbackHref,
}: AuthLinkProps) {
    const user = useContext(FirebaseUserContext);
    const router = useRouter();

    const handleClick = (
        e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
    ) => {
        e.preventDefault();
        if (user) {
            router.push(href);
        } else {
            router.push(fallbackHref);
        }
    };

    return (
        <Link href={href} onClick={handleClick}>
            {children}
        </Link>
    );
}
