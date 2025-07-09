"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface CommentFormProps {
  postId: string;
  onCommentAdded: (refreshTrigger?: number) => void;
}

export default function CommentForm({
  postId,
  onCommentAdded,
}: CommentFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const MAX_COMMENT_LENGTH = 300;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.length > MAX_COMMENT_LENGTH) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      setContent("");
      onCommentAdded(Date.now());
    } catch (err) {
      console.error("Error adding comment:", err);
      setError(err instanceof Error ? err.message : "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session?.user?.email) {
    return (
      <div className="p-4 border-t border-gray-800">
        <p className="text-gray-400 text-sm">Sign in to comment</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-gray-800">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-2 rounded-lg border border-gray-700 bg-background text-foreground resize-none min-h-[80px]"
            disabled={isSubmitting}
            maxLength={MAX_COMMENT_LENGTH}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {content.length}/{MAX_COMMENT_LENGTH}
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              !content.trim() ||
              content.length > MAX_COMMENT_LENGTH
            }
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </form>
    </div>
  );
}
