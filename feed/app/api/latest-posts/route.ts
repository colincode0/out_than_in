import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/auth";
import { kv } from "@vercel/kv";
import { Post } from "@/app/types";
import { POSTS_PER_PAGE } from "@/app/constants";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(
      searchParams.get("limit") || POSTS_PER_PAGE.toString()
    );

    // Get all usernames from the username:profile keys
    const keys = await kv.keys("username:*:profile");
    console.log("Found user keys:", keys);

    if (!keys.length) {
      console.log("No users found in KV store");
      return NextResponse.json({
        posts: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      });
    }

    // Get all posts from all users with batched database calls
    const allPosts: (Post & { commentCount: number })[] = [];

    // Collect all post IDs first
    const allPostIds: string[] = [];
    for (const key of keys) {
      const username = key.split(":")[1];
      const postIds = await kv.zrange(`user:${username}:posts`, 0, -1, {
        rev: true,
      });
      allPostIds.push(...(postIds as string[]));
    }

    // Batch fetch all posts
    const postPromises = allPostIds.map((postId) =>
      kv.get<Post>(`post:${postId}`)
    );
    const posts = await Promise.all(postPromises);

    // Batch fetch all comment counts
    const commentCountPromises = allPostIds.map((postId) =>
      kv.zcard(`post:${postId}:comments`)
    );
    const commentCounts = await Promise.all(commentCountPromises);

    // Combine posts with comment counts
    posts.forEach((post, index) => {
      if (post && !post.hidden) {
        allPosts.push({
          ...post,
          commentCount: commentCounts[index],
        });
      }
    });

    // Sort posts by date (newest first)
    allPosts.sort(
      (a, b) => new Date(b.postDate).getTime() - new Date(a.postDate).getTime()
    );

    // Calculate pagination
    const total = allPosts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = allPosts.slice(startIndex, endIndex);

    return NextResponse.json({
      posts: paginatedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching latest posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest posts data" },
      { status: 500 }
    );
  }
}
