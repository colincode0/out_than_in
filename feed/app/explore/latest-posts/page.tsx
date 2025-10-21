"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Post, UserProfile } from "@/app/types";
import PostCard from "@/app/components/PostCard";
import PaginationControls from "@/app/components/PaginationControls";
import PostsSkeletonLoader from "@/app/components/PostsSkeletonLoader";
import { POSTS_PER_PAGE, API_ENDPOINTS } from "@/app/constants";

export default function LatestPostsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<(Post & { commentCount: number })[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const profileCacheRef = useRef<Record<string, UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: POSTS_PER_PAGE,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    // Scroll to top immediately when page changes (instant for better UX)
    window.scrollTo({ top: 0, behavior: "auto" });

    // Set loading state immediately for all page transitions
    setIsPageLoading(true);

    setCurrentPage(page);
  }, []);

  useEffect(() => {
    const fetchLatestPosts = async () => {
      if (!session?.user?.email) {
        router.push("/");
        return;
      }

      // Loading state is now handled in handlePageChange

      try {
        const response = await fetch(
          `${API_ENDPOINTS.LATEST_POSTS}?page=${currentPage}&limit=${POSTS_PER_PAGE}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch latest posts");
        }
        const data = await response.json();
        setPosts(data.posts);
        setPagination(data.pagination);

        // Fetch profiles for all unique usernames in the posts (with caching)
        const uniqueUsernames: string[] = Array.from(
          new Set(data.posts.map((post: Post) => post.username))
        );

        // Only fetch profiles not in cache
        const uncachedUsernames = uniqueUsernames.filter(
          (username: string) => !profileCacheRef.current[username]
        );

        if (uncachedUsernames.length > 0) {
          const profilePromises = uncachedUsernames.map((username) => {
            return (async () => {
              const profileResponse = await fetch(
                `${API_ENDPOINTS.USER_PROFILE}?username=${username}`
              );
              if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                return [username, profileData.profile] as [string, UserProfile];
              }
              return null;
            })();
          });

          const profileResults = await Promise.all(profilePromises);
          const newProfiles = Object.fromEntries(
            profileResults.filter(
              (result): result is [string, UserProfile] => result !== null
            )
          );

          // Update cache with new profiles
          profileCacheRef.current = {
            ...profileCacheRef.current,
            ...newProfiles,
          };
        }

        // Set profiles for current page (combine cache + new profiles)
        const currentPageProfiles: Record<string, UserProfile> = {};
        uniqueUsernames.forEach((username: string) => {
          currentPageProfiles[username] = profileCacheRef.current[username];
        });
        setProfiles(currentPageProfiles);
      } catch (err) {
        console.error("Error fetching latest posts:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch latest posts"
        );
      } finally {
        setIsLoading(false);
        setIsPageLoading(false);
      }
    };

    fetchLatestPosts();
  }, [session, router, currentPage]);

  if (!session?.user?.email) {
    return null;
  }

  if (isLoading) {
    return <PostsSkeletonLoader count={POSTS_PER_PAGE} />;
  }

  // Page loading overlay for pagination
  if (isPageLoading) {
    return <PostsSkeletonLoader count={POSTS_PER_PAGE} />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto mt-12">
          <div className="text-center">
            <p className="text-xl text-white">No posts yet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto mt-12">
        <div className="space-y-8">
          <h1 className="text-xl font-bold mb-6 text-center text-white">
            Latest From All Users
          </h1>
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              profile={profiles[post.username]}
              formatDate={formatDate}
            />
          ))}
        </div>

        <PaginationControls
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
