"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface LeaderboardUser {
  username: string;
  followerCount: number;
  displayName: string;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("/api/leaderboard");
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch leaderboard"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-400">Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-background border border-gray-800 rounded-lg p-6">
          <div className="space-y-4">
            {users.map((user, index) => (
              <Link
                key={user.username}
                href={`/@${user.username}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 text-center font-bold text-gray-400">
                  #{index + 1}
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-lg font-medium">
                      {user.displayName[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">@{user.username}</p>
                    <p className="text-sm text-gray-400">
                      {user.followerCount} followers
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
