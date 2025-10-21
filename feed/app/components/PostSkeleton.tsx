"use client";

interface PostSkeletonProps {
  type?: "image" | "text";
}

export default function PostSkeleton({ type = "image" }: PostSkeletonProps) {
  return (
    <div className="bg-background border border-gray-800 rounded-lg overflow-hidden">
      {type === "image" && (
        <div className="relative aspect-square bg-gray-700 animate-pulse"></div>
      )}
      <div className="p-4">
        {/* Profile section */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
          <div className="h-4 bg-gray-700 rounded w-20 animate-pulse"></div>
        </div>

        {/* Content section */}
        {type === "image" && (
          <div className="space-y-2 mb-2">
            <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
          </div>
        )}

        {type === "text" && (
          <div className="space-y-2 mb-2">
            <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3 animate-pulse"></div>
          </div>
        )}

        {/* Metadata section */}
        <div className="flex flex-col gap-1 mt-2">
          <div className="h-3 bg-gray-700 rounded w-32 animate-pulse"></div>
          {type === "image" && (
            <div className="h-3 bg-gray-700 rounded w-28 animate-pulse"></div>
          )}
          <div className="flex items-center gap-4 mt-1">
            <div className="h-3 bg-gray-700 rounded w-16 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
