import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/auth";
import sharp from "sharp";

export async function POST(request: Request) {
  console.log("POST /api/upload - Starting upload process");

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

    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process image to remove metadata
    const processedImageBuffer = await sharp(buffer)
      .withMetadata() // Remove all metadata
      .toBuffer();

    // Generate a unique filename
    const timestamp = Date.now();
    const baseFilename = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    const filename = `${timestamp}-${baseFilename}.${file.name
      .split(".")
      .pop()}`;
    console.log("Generated filename:", filename);

    try {
      // Upload the image
      console.log("Uploading image to blob storage...");
      const blob = await put(filename, processedImageBuffer, {
        access: "public",
        addRandomSuffix: true,
        contentType: file.type,
      });
      console.log("Image uploaded successfully:", blob.url);

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
