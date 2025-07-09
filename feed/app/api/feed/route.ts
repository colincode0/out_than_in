import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/auth";
import { kv } from "@vercel/kv";
import { Post, UserProfile } from "@/app/types";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Get the profile of the user whose feed we're viewing
    const profile = await kv.get<UserProfile>(`username:${username}:profile`);
    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get list of users being followed (including the user themselves)
    const following = await kv.smembers(`user:${profile.email}:following`);
    const usersToFetch = [...following, username]; // Include the user's own posts

    // Get all posts from followed users and the user themselves with comment counts
    const allPosts: (Post & { commentCount: number })[] = [];
    for (const userToFetch of usersToFetch) {
      const postIds = await kv.zrange(`user:${userToFetch}:posts`, 0, -1, {
        rev: true,
      });

      for (const postId of postIds) {
        const post = await kv.get<Post>(`post:${postId}`);
        if (post && !post.hidden) {
          // Get comment count for this post
          const commentCount = await kv.zcard(`post:${postId}:comments`);
          allPosts.push({
            ...post,
            commentCount,
          });
        }
      }
    }

    // Sort posts by date (newest first)
    allPosts.sort(
      (a, b) => new Date(b.postDate).getTime() - new Date(a.postDate).getTime()
    );

    return NextResponse.json({ posts: allPosts });
  } catch (error) {
    console.error("Error in GET /api/feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed" },
      { status: 500 }
    );
  }
}
