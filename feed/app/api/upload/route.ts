import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/auth";

export async function POST(request: Request) {
  console.log("Received upload request");

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

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.log("No file provided in request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("Processing file:", file.name, "Size:", file.size);

    // Generate a unique filename
    const filename = `${Date.now()}-${file.name}`;
    console.log("Generated filename:", filename);

    try {
      const blob = await put(filename, file, {
        access: "public",
        addRandomSuffix: true,
      });

      console.log("Successfully uploaded to blob storage:", blob.url);
      return NextResponse.json(blob);
    } catch (blobError) {
      console.error("Blob storage error:", blobError);
      throw new Error(
        `Blob storage error: ${
          blobError instanceof Error ? blobError.message : "Unknown error"
        }`
      );
    }
  } catch (error) {
    console.error("Error in upload route:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        error: "Error uploading file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
