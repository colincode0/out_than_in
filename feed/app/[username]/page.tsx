"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { Post, UserProfile } from "@/app/types";
import { use } from "react";
import PostTypeSelector from "@/app/components/PostTypeSelector";
import DeleteConfirmationModal from "@/app/components/DeleteConfirmationModal";
import ProfileHeader from "@/app/components/ProfileHeader";
import Image from "next/image";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { data: session } = useSession();
  const { username } = use(params);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

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
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [username]);

  const handlePostComplete = (newPost: Post) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const handleDeletePost = async (post: Post) => {
    setPostToDelete(post);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;

    try {
      const response = await fetch(`/api/posts?id=${postToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      setPosts((prevPosts) =>
        prevPosts.filter((post) => post.id !== postToDelete.id)
      );
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post. Please try again.");
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
        {session ? (
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
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Log in
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto">
        <ProfileHeader profile={profile} />

        {isOwnProfile && (
          <div className="mb-8">
            <PostTypeSelector onPostComplete={handlePostComplete} />
          </div>
        )}

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
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="p-6">
                    <p className="text-lg whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>
                  <div className="px-4 py-3 border-t border-gray-800">
                    <p className="text-sm text-gray-500">
                      Posted: {formatDate(post.postDate)}
                    </p>
                  </div>
                </div>
              )}

              {isOwnProfile && (
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => handleDeletePost(post)}
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
        onConfirm={confirmDelete}
      />
    </div>
  );
}
