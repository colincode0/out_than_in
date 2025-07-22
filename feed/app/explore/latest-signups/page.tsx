"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface LatestSignupUser {
  username: string;
  displayName: string;
  createdAt: string;
  profilePicture?: string;
}

export default function LatestSignupsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<LatestSignupUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    const fetchLatestSignups = async () => {
      try {
        const response = await fetch("/api/latest-signups");
        if (!response.ok) {
          throw new Error("Failed to fetch latest signups");
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        console.error("Error fetching latest signups:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch latest signups"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestSignups();
  }, [status, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!session?.user?.email) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto mt-12">
        <h1 className="text-2xl font-bold mb-8 text-center">Latest Signups</h1>

        <div className="space-y-4">
          {users.map((user, index) => (
            <Link
              key={user.username}
              href={`/${user.username}`}
              className="block bg-background border border-gray-800 rounded-lg p-4 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 w-8">{index + 1}</span>
                  <div className="relative w-10 h-10 bg-gray-800 overflow-hidden flex-shrink-0">
                    {user.profilePicture ? (
                      <Image
                        src={user.profilePicture}
                        alt={`${user.username}'s profile picture`}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div>
                    <h2 className="font-medium">@{user.username}</h2>
                    <p className="text-sm text-gray-400">
                      Joined {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
