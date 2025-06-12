"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Post } from "@/app/types";

export default function PostPage({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { username, id } = use(params);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts?id=${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }
        const data = await response.json();
        setPost(data);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch post");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]);

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

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
          <p className="text-gray-400">
            This post doesn&apos;t exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto mt-12">
        <div className="mb-6">
          <Link
            href={`/${username}`}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
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
        </div>

        <div className="bg-background border border-gray-800 rounded-lg overflow-hidden">
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
              <div className="flex flex-col gap-1 text-sm text-gray-500 px-4 py-3 border-t border-gray-800">
                {post.caption && (
                  <p className="text-sm whitespace-pre-wrap">{post.caption}</p>
                )}
                <div className="flex flex-col gap-1">
                  <p>Posted: {formatDate(post.postDate)}</p>
                  {post.captureDate && (
                    <p>Taken: {formatDate(post.captureDate)}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="p-6">
                <p className="text-lg whitespace-pre-wrap">{post.content}</p>
              </div>
              <div className="px-4 py-3 border-t border-gray-800">
                <p className="text-sm text-gray-500">
                  Posted: {formatDate(post.postDate)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
