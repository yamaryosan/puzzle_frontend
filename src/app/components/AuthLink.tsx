'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuth from './../hooks/useAuth';

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
export default function AuthLink({ href, children, fallbackHref }: AuthLinkProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    if (loading) return;
    
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