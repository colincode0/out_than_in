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
    if (session) {
      fetchPosts();
    }
  }, [session]);

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

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center gap-4 mb-8">
          {status === "loading" ? (
            <div>Loading...</div>
          ) : session ? (
            <div className="flex flex-col items-center gap-4 w-full">
              <p>Signed in as {session.user?.email}</p>
              <PostTypeSelector onPostComplete={handlePostComplete} />
              <button
                onClick={() => signOut()}
                className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            >
              Sign in with Google
            </button>
          )}
        </div>

        {session && (
          <div className="w-full">
            {isLoading ? (
              <div>Loading posts...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 w-full">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="border rounded-lg p-4 relative group"
                  >
                    {post.type === "text" ? (
                      <div className="flex flex-col gap-2">
                        <p className="whitespace-pre-wrap">{post.content}</p>
                        <p className="text-sm text-gray-500">
                          Posted: {formatDate(post.postDate)}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="relative aspect-square">
                          <Image
                            src={post.url}
                            alt={post.caption || "Uploaded image"}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        {post.caption && (
                          <p className="text-sm">{post.caption}</p>
                        )}
                        <div className="flex flex-col gap-1 text-sm text-gray-500">
                          <p>Posted: {formatDate(post.postDate)}</p>
                          {post.captureDate && (
                            <p>Taken: {formatDate(post.captureDate)}</p>
                          )}
                        </div>
                      </div>
                    )}
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
                ))}
              </div>
            ) : (
              <div>No posts yet</div>
            )}
          </div>
        )}
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
