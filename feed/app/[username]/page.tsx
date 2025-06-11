"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Post, UserProfile } from "@/app/types";
import { use } from "react";
import PostTypeSelector from "@/app/components/PostTypeSelector";
import DeleteConfirmationModal from "@/app/components/DeleteConfirmationModal";
import Image from "next/image";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile
        const profileResponse = await fetch(`/api/user?username=${username}`);
        if (!profileResponse.ok) {
          throw new Error("Failed to fetch profile");
        }
        const profileData = await profileResponse.json();
        setProfile(profileData.profile);

        // Fetch posts
        const postsResponse = await fetch(`/api/posts?username=${username}`);
        if (!postsResponse.ok) {
          throw new Error("Failed to fetch posts");
        }
        const postsData = await postsResponse.json();
        setPosts(postsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [username]);

  const handlePostComplete = (newPost: Post) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const handleDeleteClick = (postId: string) => {
    setPostToDelete(postId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
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
      setError("Failed to delete post");
    } finally {
      setIsDeleteModalOpen(false);
      setPostToDelete(null);
    }
  };

  const handleToggleHidden = async (postId: string, currentHidden: boolean) => {
    try {
      const response = await fetch(`/api/posts?id=${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hidden: !currentHidden }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle post visibility");
      }

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, hidden: !currentHidden } : post
        )
      );
    } catch (err) {
      console.error("Error toggling post visibility:", err);
      setError("Failed to toggle post visibility");
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

      const updatedPost = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === postId ? updatedPost : post))
      );
      setEditingCaption(null);
      setEditingPostId(null);
    } catch (err) {
      console.error("Error updating caption:", err);
      setError("Failed to update caption");
    }
  };

  const handleEditText = async (postId: string, newText: string) => {
    try {
      const response = await fetch(`/api/posts?id=${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newText }),
      });

      if (!response.ok) {
        throw new Error("Failed to update text");
      }

      const updatedPost = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === postId ? updatedPost : post))
      );
      setEditingText(null);
      setEditingPostId(null);
    } catch (err) {
      console.error("Error updating text:", err);
      setError("Failed to update text");
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

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-400">Profile not found</p>
      </div>
    );
  }

  const isOwnProfile = session?.user?.email === profile.email;

  return (
    <div className="min-h-screen p-4">
      <div className="fixed top-4 right-4 z-50">
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
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="mb-8 p-6 bg-background border border-gray-800 rounded-lg">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold">@{profile.username}</h1>
            </div>
            {profile.bio && (
              <p className="text-gray-300 whitespace-pre-wrap">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Post Creation */}
        {isOwnProfile && (
          <div className="mb-8">
            <PostTypeSelector onPostComplete={handlePostComplete} />
          </div>
        )}

        {/* Posts Grid */}
        <div className="grid grid-cols-1 gap-6 w-full">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`relative group ${post.hidden ? "opacity-50" : ""}`}
            >
              {post.type === "text" ? (
                <div className="flex flex-col gap-2 p-4">
                  {editingPostId === post.id ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={editingText || post.content}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full p-2 rounded-lg border border-gray-700 bg-background text-foreground resize-none min-h-[80px]"
                        placeholder="Edit your post..."
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingText(null);
                            setEditingPostId(null);
                          }}
                          className="px-3 py-1 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() =>
                            handleEditText(post.id, editingText || "")
                          }
                          className="px-3 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start gap-2">
                        <p className="whitespace-pre-wrap flex-1">
                          {post.content}
                        </p>
                        {isOwnProfile && (
                          <button
                            onClick={() => {
                              setEditingText(post.content);
                              setEditingPostId(post.id);
                            }}
                            className="p-1 rounded-full hover:bg-gray-800 transition-colors"
                            title="Edit post"
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
                      <p className="text-sm text-gray-500">
                        Posted: {formatDate(post.postDate)}
                      </p>
                    </>
                  )}
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
                  {(post.caption ||
                    post.captureDate ||
                    editingPostId === post.id) && (
                    <div className="flex flex-col gap-1 text-sm text-gray-500 px-4 py-3 border-t border-gray-800">
                      {editingPostId === post.id ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={editingCaption || post.caption || ""}
                            onChange={(e) => setEditingCaption(e.target.value)}
                            className="w-full p-2 rounded-lg border border-gray-700 bg-background text-foreground resize-none min-h-[80px]"
                            placeholder="Add a caption..."
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingCaption(null);
                                setEditingPostId(null);
                              }}
                              className="px-3 py-1 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() =>
                                handleEditCaption(post.id, editingCaption || "")
                              }
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
                              {isOwnProfile && (
                                <button
                                  onClick={() => {
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
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {isOwnProfile && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleHidden(post.id, post.hidden)}
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
                        onClick={() => handleDeleteClick(post.id)}
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
              )}
            </div>
          ))}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPostToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
