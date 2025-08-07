import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/auth";
import { kv } from "@vercel/kv";
import { Post } from "@/app/types";

export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all usernames from the username:profile keys
    const keys = await kv.keys("username:*:profile");
    console.log("Found user keys:", keys);

    if (!keys.length) {
      console.log("No users found in KV store");
      return NextResponse.json({
        posts: [],
      });
    }

    // Get all posts from all users
    const allPosts: (Post & { commentCount: number })[] = [];
    for (const key of keys) {
      const username = key.split(":")[1];
      const postIds = await kv.zrange(`user:${username}:posts`, 0, -1, {
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

    // Return only the latest 50 posts to keep response size reasonable
    const latestPosts = allPosts.slice(0, 50);

    return NextResponse.json({
      posts: latestPosts,
    });
  } catch (error) {
    console.error("Error fetching latest posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest posts data" },
      { status: 500 }
    );
  }
}
