import { list } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/auth";

export async function GET() {
  console.log("GET /api/posts - Starting request");
  const session = await getServerSession(authConfig);
  console.log(
    "Session status:",
    session ? "Authenticated" : "Not authenticated"
  );

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { blobs } = await list();
    console.log("Found blobs:", blobs.length);

    const posts = await Promise.all(
      blobs.map(async (blob) => {
        console.log("Processing blob:", blob.pathname);
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(blob.pathname);
        const isText = blob.pathname.startsWith("post-");

        if (isText) {
          const response = await fetch(blob.url);
          const content = await response.text();
          return {
            url: blob.url,
            content,
            timestamp: blob.uploadedAt,
            type: "text" as const,
          };
        } else if (isImage) {
          return {
            url: blob.url,
            timestamp: blob.uploadedAt,
            type: "image" as const,
          };
        }
        return null;
      })
    );

    const validPosts = posts.filter(
      (post): post is NonNullable<typeof post> => post !== null
    );
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

    const timestamp = new Date().toISOString();
    const filename = `post-${timestamp}.txt`;
    console.log("Creating text file:", filename);

    const blob = await put(filename, content, {
      access: "public",
      addRandomSuffix: true,
    });

    console.log("Successfully created post:", blob.url);
    return NextResponse.json({
      url: blob.url,
      content,
      timestamp,
      type: "text" as const,
    });
  } catch (error) {
    console.error("Error in POST /api/posts:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
