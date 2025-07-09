import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/auth";
import { kv } from "@vercel/kv";
import { Comment, Post, UserProfile } from "@/app/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    // Get comment IDs for the post (chronological order)
    const commentIds = await kv.zrange(`post:${postId}:comments`, 0, -1);

    // Fetch all comments
    const comments = await Promise.all(
      commentIds.map(async (id) => {
        const comment = await kv.get<Comment>(`comment:${id}`);
        return comment;
      })
    );

    // Filter out null comments
    const validComments = comments.filter(
      (comment): comment is Comment => comment !== null
    );

    return NextResponse.json(validComments);
  } catch (error) {
    console.error("Error in GET /api/comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { postId, content } = await request.json();

    if (!postId || !content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Post ID and content are required" },
        { status: 400 }
      );
    }

    if (content.length > 300) {
      return NextResponse.json(
        { error: "Comment must be 300 characters or less" },
        { status: 400 }
      );
    }

    // Verify the post exists
    const post = await kv.get<Post>(`post:${postId}`);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get user's profile to get their username
    const profile = await kv.get<UserProfile>(
      `user:${session.user.email}:profile`
    );
    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const timestamp = Date.now();
    const commentId = `comment_${timestamp}_${Math.random()
      .toString(36)
      .substring(2, 15)}`;
    const createdAt = new Date().toISOString();

    const comment: Comment = {
      id: commentId,
      postId,
      username: profile.username,
      userEmail: session.user.email,
      content,
      createdAt,
    };

    // Store comment
    await kv.set(`comment:${commentId}`, comment);
    await kv.zadd(`post:${postId}:comments`, {
      score: timestamp,
      member: commentId,
    });

    // Update post comment count
    const currentCommentCount = await kv.zcard(`post:${postId}:comments`);
    const updatedPost = {
      ...post,
      commentCount: currentCommentCount,
    };
    await kv.set(`post:${postId}`, updatedPost);

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error in POST /api/comments:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("id");

    if (!commentId) {
      return NextResponse.json(
        { error: "Comment ID is required" },
        { status: 400 }
      );
    }

    // Get comment to verify ownership and get post ID
    const comment = await kv.get<Comment>(`comment:${commentId}`);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Check if user owns the comment
    if (comment.userEmail !== session.user.email) {
      return NextResponse.json(
        { error: "Not authorized to delete this comment" },
        { status: 403 }
      );
    }

    // Delete comment
    await kv.del(`comment:${commentId}`);
    await kv.zrem(`post:${comment.postId}:comments`, commentId);

    // Update post comment count
    const post = await kv.get<Post>(`post:${comment.postId}`);
    if (post) {
      const currentCommentCount = await kv.zcard(
        `post:${comment.postId}:comments`
      );
      const updatedPost = {
        ...post,
        commentCount: currentCommentCount,
      };
      await kv.set(`post:${comment.postId}`, updatedPost);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/comments:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
