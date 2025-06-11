"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageUploadProps {
  onUploadComplete?: (url: string, metadataTimestamp: string) => void;
}

export default function ImageUpload({ onUploadComplete }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      console.log("Starting image upload for file:", file.name);

      const formData = new FormData();
      formData.append("file", file);

      console.log("Sending request to /api/upload");
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      console.log("Upload response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Upload error response:", errorData);
        throw new Error(
          errorData?.error || `Upload failed with status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Upload successful, received data:", data);

      if (!data.url) {
        throw new Error("No URL returned from upload");
      }

      setUploadedUrl(data.url);
      onUploadComplete?.(data.url, data.metadataTimestamp);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload image";
      setError(errorMessage);
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`cursor-pointer rounded-full border border-solid border-transparent transition-colors flex items-center justify-center ${
            uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
          } font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5`}
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {uploadedUrl && (
        <div className="relative w-full max-w-md aspect-square">
          <Image
            src={uploadedUrl}
            alt="Uploaded image"
            fill
            className="object-cover rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
