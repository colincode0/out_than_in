"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function PostButton() {
  const { data: session } = useSession();

  if (!session?.user?.email) return null;

  return (
    <Link
      href="/post"
      className="fixed top-4 right-4 z-40 p-2 rounded-lg hover:bg-gray-800 transition-colors"
      aria-label="Create post"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
    </Link>
  );
}
