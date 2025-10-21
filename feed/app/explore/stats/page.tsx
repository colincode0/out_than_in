"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TopFollowedAccount {
  username: string;
  displayName: string;
  followerCount: number;
  profilePicture?: string;
}

interface StatisticsData {
  totalUsers: number;
  totalPosts: number;
  topFollowedAccounts: TopFollowedAccount[];
}

export default function StatisticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch statistics");
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching statistics:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch statistics"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchStats();
    }
  }, [status, router]);

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

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-400">No statistics available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto mt-12">
        <h1 className="text-2xl font-bold mb-8 text-center">Statistics</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Total Users */}
          <div className="bg-background border border-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-300">
                  Total Users
                </h3>
                <p className="text-3xl font-bold text-white">
                  {stats.totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Total Posts */}
          <div className="bg-background border border-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-300">
                  Total Posts
                </h3>
                <p className="text-3xl font-bold text-white">
                  {stats.totalPosts.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Followed Accounts */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center mb-4">
            Top 5 Most Followed Accounts
          </h2>

          {stats.topFollowedAccounts.length > 0 ? (
            stats.topFollowedAccounts.map((account, index) => (
              <Link
                key={account.username}
                href={`/${account.username}`}
                className="block bg-background border border-gray-800 rounded-lg p-4 hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 w-8">#{index + 1}</span>
                    <div className="relative w-10 h-10 bg-gray-800 overflow-hidden flex-shrink-0 rounded-full">
                      {account.profilePicture ? (
                        <img
                          src={account.profilePicture}
                          alt={`${account.username}'s profile picture`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          className="w-6 h-6 text-gray-400 m-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">
                        {account.displayName}
                      </h3>
                      <p className="text-sm text-gray-400">
                        @{account.username} • {account.followerCount}{" "}
                        {account.followerCount === 1 ? "follower" : "followers"}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
