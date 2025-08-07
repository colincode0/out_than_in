"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Comment, UserProfile } from "@/app/types";
import TextWithMentions from "@/app/components/TextWithMentions";
import DeleteConfirmationModal from "@/app/components/DeleteConfirmationModal";

interface CommentListProps {
  postId: string;
  onCommentDeleted: () => void;
  refreshTrigger?: number;
}

export default function CommentList({
  postId,
  onCommentDeleted,
  refreshTrigger,
}: CommentListProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/comments?postId=${postId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await response.json();
      setComments(data);

      // Fetch profiles for all unique usernames in the comments
      const uniqueUsernames = Array.from(
        new Set(data.map((comment: Comment) => comment.username))
      );
      const profilePromises = uniqueUsernames.map((username) => {
        return (async () => {
          const profileResponse = await fetch(`/api/user?username=${username}`);
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
      console.error("Error fetching comments:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch comments");
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [postId, refreshTrigger, fetchComments]);

  const handleDeleteClick = (commentId: string) => {
    setCommentToDelete(commentId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!commentToDelete) return;

    try {
      const response = await fetch(`/api/comments?id=${commentToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      setComments((prev) =>
        prev.filter((comment) => comment.id !== commentToDelete)
      );
      onCommentDeleted();
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Failed to delete comment. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
      setCommentToDelete(null);
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
      <div className="p-4 border-t border-gray-800">
        <p className="text-gray-400 text-sm">Loading comments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border-t border-gray-800">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="p-4 border-t border-gray-800">
        <p className="text-gray-400 text-sm">No comments yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="border-t border-gray-800">
        {comments.map((comment) => {
          const isOwnComment = session?.user?.email === comment.userEmail;
          const profile = profiles[comment.username];

          return (
            <div
              key={comment.id}
              className="p-4 border-b border-gray-800 last:border-b-0"
            >
              <div className="flex gap-3">
                <div className="relative w-8 h-8 bg-gray-800 flex-shrink-0">
                  {profile?.profilePicture ? (
                    <Image
                      src={profile.profilePicture}
                      alt={`${comment.username}'s profile picture`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/${comment.username}`}
                          className="font-medium hover:text-gray-300 transition-colors"
                        >
                          @{comment.username}
                        </Link>
                        <span className="text-gray-500 text-sm">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap">
                        <TextWithMentions text={comment.content} />
                      </p>
                    </div>
                    {isOwnComment && (
                      <button
                        onClick={() => handleDeleteClick(comment.id)}
                        className="p-1 rounded-full hover:bg-gray-800 transition-colors flex-shrink-0"
                        title="Delete comment"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-gray-500 hover:text-red-500"
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
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCommentToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
