"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { Post } from "@/app/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FeedPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { username } = use(params);

  useEffect(() => {
    const fetchFeed = async () => {
      if (!session?.user?.email) {
        router.push("/");
        return;
      }

      try {
        const response = await fetch(`/api/feed?username=${username}`);
        if (!response.ok) {
          if (response.status === 404) {
            // User isn't following anyone, set empty posts array
            setPosts([]);
            return;
          }
          throw new Error("Failed to fetch feed");
        }
        const data = await response.json();
        setPosts(data.posts);
      } catch (err) {
        console.error("Error fetching feed:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch feed");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeed();
  }, [session, username, router]);

  if (!session?.user?.email) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-400">Loading feed...</p>
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
            <p className="text-xl text-white">
              @{username} is not following anyone yet
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto mt-12">
        <div className="space-y-8">
          <h1 className="text-xl font-bold mb-6 text-center text-white">
            Following
          </h1>
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-background border border-gray-800 rounded-lg overflow-hidden"
            >
              {post.type === "image" && (
                <div className="relative aspect-square">
                  <Image
                    src={post.url}
                    alt={post.caption || "Post image"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Link
                    href={`/${post.username}`}
                    className="font-medium hover:text-gray-300 transition-colors"
                  >
                    @{post.username}
                  </Link>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">
                    {new Date(post.postDate).toLocaleDateString()}
                  </span>
                </div>
                {post.type === "image" && post.caption && (
                  <p className="text-gray-300 mb-2">{post.caption}</p>
                )}
                {post.type === "text" && (
                  <p className="text-gray-300 whitespace-pre-wrap">
                    {post.content}
                  </p>
                )}
                {post.type === "image" && post.captureDate && (
                  <p className="text-sm text-gray-500">
                    Captured: {new Date(post.captureDate).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
