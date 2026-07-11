'use client'

import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";

export default function AuthNav() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <nav className="flex items-center gap-4 text-sm">
      {isLoaded && isSignedIn ? (
        <>
          <Link
            href="/dashboard"
            className="rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
          >
            Dashboard
          </Link>
          <UserButton />
        </>
      ) : (
        <Link
          href="/sign-in"
          className="rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
        >
          Iniciar sesión
        </Link>
      )}
    </nav>
  );
}
