"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { UserProfile } from "@/app/types";

export default function FollowingPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { username } = use(params);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const response = await fetch(
          `/api/user/following?username=${username}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch following list");
        }
        const data = await response.json();
        setFollowing(data.following);
      } catch (err) {
        console.error("Error fetching following:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch following list"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowing();
  }, [username]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-400">Loading...</p>
      </div>
    );
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
        <div className="mb-8">
          <Link
            href={`/${username}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300 transition-colors mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to @{username}
          </Link>
          <h1 className="text-2xl font-bold">@{username} following</h1>
        </div>

        {following.length === 0 ? (
          <p className="text-gray-400">Not following anyone yet</p>
        ) : (
          <div className="space-y-4">
            {following.map((profile) => (
              <Link
                key={profile.username}
                href={`/${profile.username}`}
                className="flex items-center gap-4 p-4 bg-background border border-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
              >
                <div className="relative w-12 h-12 bg-gray-800">
                  {profile.profilePicture ? (
                    <Image
                      src={profile.profilePicture}
                      alt={`${profile.username}'s profile picture`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-medium">@{profile.username}</h2>
                  {profile.bio && (
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
