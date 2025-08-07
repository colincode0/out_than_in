"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Post, UserProfile } from "@/app/types";

export default function LatestPostsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<(Post & { commentCount: number })[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestPosts = async () => {
      if (!session?.user?.email) {
        router.push("/");
        return;
      }

      try {
        const response = await fetch("/api/latest-posts");
        if (!response.ok) {
          throw new Error("Failed to fetch latest posts");
        }
        const data = await response.json();
        setPosts(data.posts);

        // Fetch profiles for all unique usernames in the posts
        const uniqueUsernames = Array.from(
          new Set(data.posts.map((post: Post) => post.username))
        );
        const profilePromises = uniqueUsernames.map((username) => {
          return (async () => {
            const profileResponse = await fetch(
              `/api/user?username=${username}`
            );
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              return [username, profileData.profile] as [string, UserProfile];
            }
            return null;
          })();
        });

        const profileResults = await Promise.all(profilePromises);
        const profilesMap = Object.fromEntries(
          profileResults.filter(
            (result): result is [string, UserProfile] => result !== null
          )
        );
        setProfiles(profilesMap);
      } catch (err) {
        console.error("Error fetching latest posts:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch latest posts"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestPosts();
  }, [session, router]);

  if (!session?.user?.email) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-400">Loading posts...</p>
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

  if (posts.length === 0) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto mt-12">
          <div className="text-center">
            <p className="text-xl text-white">No posts yet</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto mt-12">
        <div className="space-y-8">
          <h1 className="text-xl font-bold mb-6 text-center text-white">
            Latest From All Users
          </h1>
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-background border border-gray-800 rounded-lg overflow-hidden"
            >
              {post.type === "image" && (
                <div className="relative aspect-square">
                  <Link href={`/${post.username}/post/${post.id}`}>
                    <Image
                      src={post.url}
                      alt={post.caption || "Post image"}
                      fill
                      className="object-cover"
                    />
                  </Link>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative w-8 h-8 bg-gray-800">
                    {profiles[post.username]?.profilePicture ? (
                      <Image
                        src={profiles[post.username].profilePicture as string}
                        alt={`${post.username}'s profile picture`}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <Link
                    href={`/${post.username}`}
                    className="font-medium hover:text-gray-300 transition-colors"
                  >
                    @{post.username}
                  </Link>
                </div>
                {post.type === "image" && post.caption && (
                  <p className="text-gray-300 mb-2">{post.caption}</p>
                )}
                {post.type === "text" && (
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {post.content}
                  </p>
                )}
                <div className="flex flex-col gap-1 text-sm text-gray-500 mt-2">
                  <p>Posted: {formatDate(post.postDate)}</p>
                  {post.type === "image" && post.captureDate && (
                    <p>Taken: {formatDate(post.captureDate)}</p>
                  )}
                  <div className="flex items-center gap-4 mt-1">
                    <Link
                      href={`/${post.username}/post/${post.id}`}
                      className="flex items-center gap-1 hover:text-gray-300 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      {post.commentCount}{" "}
                      {post.commentCount === 1 ? "comment" : "comments"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
