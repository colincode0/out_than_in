"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Post } from "@/app/types";

export default function FeedPage({ params }: { params: { username: string } }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await fetch(`/api/feed?username=${params.username}`);
        if (!response.ok) {
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
  }, [params.username]);

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
        <div className="flex flex-col gap-6">
          {posts.map((post) => (
            <div key={post.id} className="relative group">
              {post.type === "image" ? (
                <div className="flex flex-col">
                  <div className="relative aspect-square">
                    <Image
                      src={post.url}
                      alt={post.caption || "Uploaded image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {(post.caption || post.captureDate) && (
                    <div className="flex flex-col gap-1 text-sm text-gray-500 px-4 py-3 border-t border-gray-800">
                      {post.caption && (
                        <p className="text-gray-300">{post.caption}</p>
                      )}
                      {post.captureDate && (
                        <p className="text-gray-500">
                          Captured on {formatDate(post.captureDate)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="p-4 border border-gray-800 rounded-lg">
                    <p className="text-gray-300 whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
