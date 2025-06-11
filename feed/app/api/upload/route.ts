import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/auth";
import exifr from "exifr";
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
    const caption = formData.get("caption") as string | null;

    if (!file) {
      console.log("No file provided in request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("Processing file:", file.name, "Size:", file.size);
    if (caption && caption.trim()) {
      console.log("Caption provided:", caption);
    }

    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract metadata before processing
    let metadataTimestamp: string | null = null;
    try {
      const exifData = await exifr.parse(buffer);
      if (exifData?.DateTimeOriginal) {
        metadataTimestamp = new Date(exifData.DateTimeOriginal).toISOString();
        console.log("Extracted timestamp from metadata:", metadataTimestamp);
      }
    } catch (exifError) {
      console.log("No EXIF data found or error reading EXIF:", exifError);
    }

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
      // Upload the image with caption in headers
      console.log("Uploading image to blob storage...");
      const blob = await put(filename, processedImageBuffer, {
        access: "public",
        addRandomSuffix: true,
        contentType: file.type,
        headers: {
          "x-caption": caption?.trim() || "",
          "x-timestamp": metadataTimestamp || new Date().toISOString(),
        },
      });
      console.log("Image uploaded successfully:", blob.url);

      const response = {
        ...blob,
        metadataTimestamp: metadataTimestamp || new Date().toISOString(),
        caption: caption?.trim() || undefined,
      };
      console.log("Sending response:", response);

      return NextResponse.json(response);
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
