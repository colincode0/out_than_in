"use client";

import PostSkeleton from "@/app/components/PostSkeleton";
import { POSTS_PER_PAGE } from "@/app/constants";

interface PostsSkeletonLoaderProps {
  count?: number;
}

export default function PostsSkeletonLoader({
  count = POSTS_PER_PAGE,
}: PostsSkeletonLoaderProps) {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto mt-12">
        <div className="space-y-8">
          <h1 className="text-xl font-bold mb-6 text-center text-white">
            Latest From All Users
          </h1>
          {Array.from({ length: count }, (_, index) => (
            <PostSkeleton
              key={index}
              type={index % 3 === 0 ? "text" : "image"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
