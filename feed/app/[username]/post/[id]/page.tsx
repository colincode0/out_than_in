"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import { Post } from "@/app/types";
import { useSession } from "next-auth/react";

export default function PostPage({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}) {
  const { data: session } = useSession();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const { id } = use(params);

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

  const handleDelete = async () => {
    if (!post) return;
    try {
      const response = await fetch(`/api/posts?id=${post.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete post");
      }
      // Redirect to profile after delete
      window.location.href = `/${post.username}`;
    } catch {
      alert("Failed to delete post. Please try again.");
    }
  };

  const handleEditCaption = async (newCaption: string) => {
    if (!post) return;
    try {
      const response = await fetch(`/api/posts?id=${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ caption: newCaption }),
      });

      if (!response.ok) {
        throw new Error("Failed to update caption");
      }

      const updatedPost = await response.json();
      setPost(updatedPost);
      setEditingCaption(null);
    } catch (err) {
      console.error("Error updating caption:", err);
      alert("Failed to update caption. Please try again.");
    }
  };

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

  const isOwnPost = session?.user?.email === post.userEmail;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto mt-12 relative">
        {/* Delete button for post owner */}
        {isOwnPost && (
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={handleDelete}
              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              title="Delete post"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}
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
                {editingCaption !== null ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editingCaption}
                      onChange={(e) => setEditingCaption(e.target.value)}
                      className="w-full p-2 rounded-lg border border-gray-700 bg-background text-foreground resize-none min-h-[80px] text-base"
                      placeholder="Add a caption..."
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingCaption(null)}
                        className="px-3 py-1 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditCaption(editingCaption)}
                        className="px-3 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {post.caption && (
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-sm whitespace-pre-wrap flex-1">
                          {post.caption}
                        </p>
                        {isOwnPost && (
                          <button
                            onClick={() =>
                              setEditingCaption(post.caption || "")
                            }
                            className="p-1 rounded-full hover:bg-gray-800 transition-colors"
                            title="Edit caption"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </>
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
