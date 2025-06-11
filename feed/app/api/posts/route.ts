import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/auth";
import { kv } from "@vercel/kv";
import { Post } from "@/app/types";

export async function GET() {
  console.log("GET /api/posts - Starting request");
  try {
    // Get post IDs in reverse chronological order
    const postIds = await kv.zrange("posts", 0, -1, { rev: true });
    console.log("Found post IDs:", postIds.length);

    // Fetch all post metadata
    const posts = await Promise.all(
      postIds.map(async (id) => {
        const post = await kv.get<Post>(`post:${id}`);
        return post;
      })
    );

    const validPosts = posts.filter((post): post is Post => post !== null);
    console.log("Returning posts:", validPosts.length);
    return NextResponse.json(validPosts);
  } catch (error) {
    console.error("Error in GET /api/posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log("POST /api/posts - Starting to create post");

  try {
    const session = await getServerSession(authConfig);
    console.log(
      "Session status:",
      session ? "Authenticated" : "Not authenticated"
    );

    if (!session) {
      console.log("Unauthorized request - no session");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { content } = await request.json();
    console.log("Received content:", content);

    if (!content || typeof content !== "string") {
      console.log("Invalid content provided");
      return NextResponse.json(
        { error: "Content is required and must be a string" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const id = `text_${timestamp}_${Math.random()
      .toString(36)
      .substring(2, 15)}`;
    const postDate = new Date().toISOString();

    // Get the current highest order number
    const postIds = await kv.zrange("posts", 0, -1, { rev: true });
    const currentHighestOrder =
      postIds.length > 0
        ? (await kv.get<number>(`order:${postIds[0]}`)) || 0
        : 0;
    const newOrder = currentHighestOrder + 1;

    const post = {
      id,
      type: "text" as const,
      content,
      postDate,
      captureDate: null,
    };

    // Store in KV
    await kv.set(`post:${id}`, post);
    await kv.set(`order:${id}`, newOrder);
    await kv.zadd("posts", { score: timestamp, member: id });

    console.log("Successfully created post:", id);
    return NextResponse.json(post);
  } catch (error) {
    console.error("Error in POST /api/posts:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  console.log("DELETE /api/posts - Starting delete process");

  try {
    const session = await getServerSession(authConfig);
    console.log(
      "Session status:",
      session ? "Authenticated" : "Not authenticated"
    );

    if (!session) {
      console.log("Unauthorized request - no session");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      console.log("No ID provided for deletion");
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Get post data to delete blob if it's an image
    const post = await kv.get<Post>(`post:${id}`);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Delete from blob storage if it's an image
    if (post.type === "image") {
      const { del } = await import("@vercel/blob");
      await del(post.url);
    }

    // Delete from KV
    await kv.del(`post:${id}`);
    await kv.del(`order:${id}`);
    await kv.zrem("posts", id);

    console.log("Successfully deleted post:", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/posts:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  console.log("PATCH /api/posts - Starting update process");

  try {
    const session = await getServerSession(authConfig);
    console.log(
      "Session status:",
      session ? "Authenticated" : "Not authenticated"
    );

    if (!session) {
      console.log("Unauthorized request - no session");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      console.log("No ID provided for update");
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { hidden } = await request.json();

    if (typeof hidden !== "boolean") {
      console.log("Invalid hidden value provided");
      return NextResponse.json(
        { error: "Hidden value must be a boolean" },
        { status: 400 }
      );
    }

    // Get current post data
    const post = await kv.get<Post>(`post:${id}`);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Update post with new hidden status
    const updatedPost = { ...post, hidden };
    await kv.set(`post:${id}`, updatedPost);

    console.log("Successfully updated post:", id);
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error in PATCH /api/posts:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}
