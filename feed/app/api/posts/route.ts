import { put, list } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/auth";

export async function GET() {
  console.log("Received GET request to /api/posts");

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

    // List all blobs
    const { blobs } = await list();
    console.log("Found blobs:", blobs.length);

    // Process each blob
    const posts = await Promise.all(
      blobs.map(async (blob) => {
        // If it's a text post (starts with 'post-')
        if (blob.pathname.startsWith("post-")) {
          try {
            const response = await fetch(blob.url);
            const content = await response.text();
            return {
              url: blob.url,
              content,
              timestamp: blob.uploadedAt,
              type: "text",
            };
          } catch (error) {
            console.error("Error fetching text post content:", error);
            return null;
          }
        }
        // If it's an image (has an image extension)
        else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(blob.pathname)) {
          return {
            url: blob.url,
            timestamp: blob.uploadedAt,
            type: "image",
          };
        }
        return null;
      })
    );

    // Filter out null values and sort by timestamp
    const validPosts = posts
      .filter((post): post is NonNullable<typeof post> => post !== null)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

    console.log("Returning posts:", validPosts.length);
    return NextResponse.json(validPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      {
        error: "Error fetching posts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log("Received POST request to /api/posts");

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

    const body = await request.json();
    console.log("Request body:", body);

    const { content } = body;
    console.log("Received content:", content);

    if (!content || typeof content !== "string") {
      console.log("Invalid content format");
      return NextResponse.json(
        { error: "Content is required and must be a string" },
        { status: 400 }
      );
    }

    // Create a text file with the content
    const filename = `post-${Date.now()}.txt`;
    console.log(
      "Attempting to upload to blob storage with filename:",
      filename
    );

    try {
      const blob = await put(filename, content, {
        access: "public",
        addRandomSuffix: true,
      });

      console.log("Successfully uploaded to blob storage:", blob.url);

      return NextResponse.json({
        url: blob.url,
        content,
        timestamp: new Date().toISOString(),
        type: "text",
      });
    } catch (blobError) {
      console.error("Blob storage error:", blobError);
      throw new Error(
        `Blob storage error: ${
          blobError instanceof Error ? blobError.message : "Unknown error"
        }`
      );
    }
  } catch (error) {
    console.error("Detailed error in POST /api/posts:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: "Error creating post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
