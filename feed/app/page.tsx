"use client";

import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import PostTypeSelector from "./components/PostTypeSelector";
import { Post } from "./types";

export default function Home() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      // Sort posts by postDate in descending order (newest first)
      const sortedPosts = data.sort(
        (a: Post, b: Post) =>
          new Date(b.postDate).getTime() - new Date(a.postDate).getTime()
      );
      setPosts(sortedPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostComplete = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
  };

  const handleDeleteClick = (post: Post) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      const response = await fetch(`/api/posts?id=${postToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      setPosts((prev) => prev.filter((post) => post.id !== postToDelete.id));
      setDeleteModalOpen(false);
      setPostToDelete(null);
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post. Please try again.");
    }
  };

  const handleToggleHidden = async (post: Post) => {
    try {
      const response = await fetch(`/api/posts?id=${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hidden: !post.hidden }),
      });

      if (!response.ok) {
        throw new Error("Failed to update post");
      }

      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, hidden: !p.hidden } : p))
      );
    } catch (err) {
      console.error("Error updating post:", err);
      alert("Failed to update post. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString)
      .toLocaleString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", "")
      .replace(" at", " at");
  };

  // Filter out hidden posts for non-authenticated users
  const visiblePosts = session ? posts : posts.filter((post) => !post.hidden);

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="fixed top-4 right-4 z-50">
        {status === "loading" ? (
          <div>Loading...</div>
        ) : session ? (
          <button
            onClick={() => signOut()}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            title="Sign out"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            title="Sign in"
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
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
          </button>
        )}
      </div>

      <main className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          {session && <PostTypeSelector onPostComplete={handlePostComplete} />}
        </div>

        <div className="w-full">
          {isLoading ? (
            <div>Loading posts...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : visiblePosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 w-full">
              {visiblePosts.map((post) => (
                <div
                  key={post.id}
                  className={`relative group ${
                    post.hidden ? "opacity-50" : ""
                  }`}
                >
                  {post.type === "text" ? (
                    <div className="flex flex-col gap-2 p-4">
                      <p className="whitespace-pre-wrap">{post.content}</p>
                      <p className="text-sm text-gray-500">
                        Posted: {formatDate(post.postDate)}
                      </p>
                    </div>
                  ) : (
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
                            <p className="text-sm whitespace-pre-wrap">
                              {post.caption}
                            </p>
                          )}
                          <div className="flex flex-col gap-1">
                            <p>Posted: {formatDate(post.postDate)}</p>
                            {post.captureDate && (
                              <p>Taken: {formatDate(post.captureDate)}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {session && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleHidden(post)}
                        className="absolute top-2 left-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600"
                        title={post.hidden ? "Unhide post" : "Hide post"}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <g>
                            {post.hidden ? (
                              <>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </>
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            )}
                          </g>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(post)}
                        className="absolute top-2 right-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                        title="Delete post"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div>No posts yet</div>
          )}
        </div>
      </main>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPostToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
