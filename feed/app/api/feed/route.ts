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

    // Get user's profile to verify they're requesting their own feed
    const profile = await kv.get<UserProfile>(
      `user:${session.user.email}:profile`
    );
    if (!profile || profile.username !== username) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get list of users being followed
    const following = await kv.smembers(`user:${session.user.email}:following`);
    if (following.length === 0) {
      return NextResponse.json({ posts: [] });
    }

    // Get all posts from followed users
    const allPosts: Post[] = [];
    for (const followedUsername of following) {
      const postIds = await kv.zrange(`user:${followedUsername}:posts`, 0, -1, {
        rev: true,
      });

      for (const postId of postIds) {
        const post = await kv.get<Post>(`post:${postId}`);
        if (post && !post.hidden) {
          allPosts.push(post);
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
