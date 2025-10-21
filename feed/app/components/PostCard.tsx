"use client";

import Link from "next/link";
import Image from "next/image";
import { Post, UserProfile } from "@/app/types";
import TextWithMentions from "@/app/components/TextWithMentions";

interface PostCardProps {
  post: Post & { commentCount: number };
  profile: UserProfile | undefined;
  formatDate: (dateString: string) => string;
}

export default function PostCard({ post, profile, formatDate }: PostCardProps) {
  return (
    <div className="bg-background border border-gray-800 rounded-lg overflow-hidden">
      {post.type === "image" && (
        <div className="relative aspect-square">
          <Link href={`/${post.username}/post/${post.id}`}>
            <Image
              src={post.url}
              alt={post.caption || "Post image"}
              fill
              className="object-cover"
            />
          </Link>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative w-8 h-8 bg-gray-800">
            {profile?.profilePicture ? (
              <Image
                src={profile.profilePicture as string}
                alt={`${post.username}'s profile picture`}
                fill
                className="object-cover"
              />
            ) : null}
          </div>
          <Link
            href={`/${post.username}`}
            className="font-medium hover:text-gray-300 transition-colors"
          >
            @{post.username}
          </Link>
        </div>
        {post.type === "image" && post.caption && (
          <p className="text-gray-300 mb-2">
            <TextWithMentions text={post.caption} />
          </p>
        )}
        {post.type === "text" && (
          <p className="text-gray-300 whitespace-pre-wrap">
            <TextWithMentions text={post.content} />
          </p>
        )}
        <div className="flex flex-col gap-1 text-sm text-gray-500 mt-2">
          <p>Posted: {formatDate(post.postDate)}</p>
          {post.type === "image" && post.captureDate && (
            <p>Taken: {formatDate(post.captureDate)}</p>
          )}
          <div className="flex items-center gap-4 mt-1">
            <Link
              href={`/${post.username}/post/${post.id}`}
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
    </div>
  );
}
