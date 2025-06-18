"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Post, UserProfile } from "@/app/types";
import ProfileHeader from "@/app/components/ProfileHeader";
import DeleteConfirmationModal from "@/app/components/DeleteConfirmationModal";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import QRCodeModal from "@/app/components/QRCodeModal";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<(Post & { commentCount: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [following, setFollowing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"list" | "grid" | "text">(
    (searchParams.get("viewMode") as "list" | "grid" | "text") || "grid"
  );
  const { username } = use(params);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/user?username=${username}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("User not found");
        } else {
          throw new Error("Failed to fetch profile");
        }
        return;
      }
      const data = await response.json();
      setProfile(data.profile);
      setFollowing(data.following);
      setIsFollowing(data.isFollowing);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/posts?username=${username}`);
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
    }
  };

  const handleFollow = async () => {
    if (!session?.user?.email) return;
    setIsFollowLoading(true);
    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: isFollowing ? "unfollow" : "follow",
          targetUsername: profile?.username,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update following status");
      }

      setIsFollowing(!isFollowing);
      fetchProfile();
    } catch (err) {
      console.error("Error updating following status:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update following status"
      );
    } finally {
      setIsFollowLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProfile(), fetchPosts()]);
      setIsLoading(false);
    };
    fetchData();
  }, [username]);

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;

    try {
      const response = await fetch(`/api/posts?id=${postToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      setPosts((prevPosts) =>
        prevPosts.filter((post) => post.id !== postToDelete)
      );
    } catch (err) {
      console.error("Error deleting post:", err);
      setError(err instanceof Error ? err.message : "Failed to delete post");
    } finally {
      setIsDeleteModalOpen(false);
      setPostToDelete(null);
    }
  };

  const handleEditCaption = async (postId: string, newCaption: string) => {
    try {
      const response = await fetch(`/api/posts?id=${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ caption: newCaption }),
      });

      if (!response.ok) {
        throw new Error("Failed to update caption");
      }

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, caption: newCaption } : post
        )
      );
    } catch (err) {
      console.error("Error updating caption:", err);
      setError(err instanceof Error ? err.message : "Failed to update caption");
    } finally {
      setEditingCaption(null);
      setEditingPostId(null);
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
          <p className="text-gray-400">@{username} doesn&apos;t exist yet.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const isOwnProfile = session?.user?.email === profile.email;

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto mt-12">
        <ProfileHeader
          profile={profile}
          onProfileUpdate={fetchProfile}
          following={following}
          isFollowing={isFollowing}
          isFollowLoading={isFollowLoading}
          handleFollow={handleFollow}
          onQRCodeClick={() => setIsQRModalOpen(true)}
        />

        {/* View toggle */}
        <div className="flex justify-center mb-4">
          <button
            className={`px-3 py-1 rounded-l-lg border border-gray-700 text-gray-300 ${
              viewMode === "list" ? "bg-gray-800" : "hover:bg-gray-800"
            }`}
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
          >
            List
          </button>
          <button
            className={`px-3 py-1 border-t border-b border-gray-700 text-gray-300 ${
              viewMode === "grid" ? "bg-gray-800" : "hover:bg-gray-800"
            }`}
            onClick={() => setViewMode("grid")}
            aria-pressed={viewMode === "grid"}
          >
            Grid
          </button>
          <button
            className={`px-3 py-1 rounded-r-lg border-t border-b border-r border-gray-700 text-gray-300 ${
              viewMode === "text" ? "bg-gray-800" : "hover:bg-gray-800"
            }`}
            onClick={() => setViewMode("text")}
            aria-pressed={viewMode === "text"}
          >
            Text
          </button>
        </div>

        {viewMode === "grid" ? (
          <div className="w-full grid grid-cols-4 gap-1">
            {posts
              .filter((post) => post.type === "image")
              .map((post) => (
                <Link
                  key={post.id}
                  href={`/${username}/post/${post.id}`}
                  className="block w-full aspect-square relative"
                  style={{ minWidth: 0 }}
                >
                  <Image
                    src={post.url}
                    alt=""
                    fill
                    className="object-cover w-full h-full"
                    priority={false}
                  />
                </Link>
              ))}
          </div>
        ) : viewMode === "text" ? (
          <div className="flex flex-col gap-6">
            {posts
              .filter((post) => post.type === "text")
              .map((post) => (
                <Link
                  key={post.id}
                  href={`/${username}/post/${post.id}`}
                  className="block bg-background border border-gray-800 rounded-lg p-6 hover:bg-gray-900 transition-colors relative"
                >
                  {isOwnProfile && (
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setPostToDelete(post.id);
                          setIsDeleteModalOpen(true);
                        }}
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
                  <p className="text-lg whitespace-pre-wrap mb-2">
                    {post.content}
                  </p>
                  <p className="text-sm text-gray-500">
                    Posted: {formatDate(post.postDate)}
                  </p>
                </Link>
              ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {posts.map((post) => (
              <div key={post.id} className="relative group">
                {post.type === "image" ? (
                  <div className="flex flex-col">
                    <div className="relative aspect-square">
                      <Link href={`/${username}/post/${post.id}`}>
                        <Image
                          src={post.url}
                          alt={post.caption || "Uploaded image"}
                          fill
                          className="object-cover"
                        />
                      </Link>
                    </div>
                    {/* Delete button for image posts */}
                    {isOwnProfile && (
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => {
                            setPostToDelete(post.id);
                            setIsDeleteModalOpen(true);
                          }}
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
                    <div className="flex flex-col gap-1 text-sm text-gray-500 px-4 py-3 border-t border-gray-800">
                      {editingPostId === post.id ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={editingCaption ?? post.caption ?? ""}
                            onChange={(e) => setEditingCaption(e.target.value)}
                            className="w-full p-2 rounded-lg border border-gray-700 bg-background text-foreground resize-none min-h-[80px] text-base"
                            placeholder="Add a caption..."
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setEditingCaption(null);
                                setEditingPostId(null);
                              }}
                              className="px-3 py-1 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleEditCaption(
                                  post.id,
                                  editingCaption ?? ""
                                );
                              }}
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
                              <p className="text-gray-300 whitespace-pre-wrap flex-1">
                                {post.caption}
                              </p>
                              {isOwnProfile && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setEditingCaption(post.caption || "");
                                    setEditingPostId(post.id);
                                  }}
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
                          <div className="flex flex-col gap-1">
                            <p>Posted: {formatDate(post.postDate)}</p>
                            {post.captureDate && (
                              <p>Taken: {formatDate(post.captureDate)}</p>
                            )}
                            <div className="flex items-center gap-4 mt-1">
                              <Link
                                href={`/${username}/post/${post.id}`}
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
                                {post.commentCount === 1
                                  ? "comment"
                                  : "comments"}
                              </Link>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col bg-background border border-gray-800 rounded-lg overflow-hidden">
                    <div className="p-6">
                      <p className="text-lg whitespace-pre-wrap">
                        {post.content}
                      </p>
                    </div>
                    {/* Delete button for text posts */}
                    {isOwnProfile && (
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => {
                            setPostToDelete(post.id);
                            setIsDeleteModalOpen(true);
                          }}
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
                    <div className="px-4 py-3 border-t border-gray-800">
                      <p className="text-sm text-gray-500">
                        Posted: {formatDate(post.postDate)}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <Link
                          href={`/${username}/post/${post.id}`}
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPostToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        profileUrl={`${window.location.origin}/${username}`}
        username={username}
      />
    </div>
  );
}
