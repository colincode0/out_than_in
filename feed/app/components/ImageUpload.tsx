"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ImagePost } from "@/app/types";

interface ImageUploadProps {
  onUploadComplete?: (post: ImagePost) => void;
}

export default function ImageUpload({ onUploadComplete }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [exifData, setExifData] = useState<{ captureDate: string | null }>({
    captureDate: null,
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSelectedFile(file);

    // Create preview URL
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Extract EXIF data
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const exifr = (await import("exifr")).default;
      const exifData = await exifr.parse(buffer);
      if (exifData?.DateTimeOriginal) {
        setExifData({
          captureDate: new Date(exifData.DateTimeOriginal).toISOString(),
        });
      }
    } catch (err) {
      console.log("No EXIF data found or error reading EXIF:", err);
      setExifData({ captureDate: null });
    }
  };

  const handlePost = async () => {
    if (!selectedFile || !previewUrl) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("caption", caption);
      formData.append("captureDate", exifData.captureDate || "");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error || `Upload failed with status: ${response.status}`
        );
      }

      const data = await response.json();
      onUploadComplete?.(data);

      // Reset state
      setPreviewUrl(null);
      setCaption("");
      setSelectedFile(null);
      setExifData({ captureDate: null });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload image";
      setError(errorMessage);
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setCaption("");
    setSelectedFile(null);
    setExifData({ captureDate: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`cursor-pointer rounded-full border border-solid border-transparent transition-colors flex items-center justify-center ${
            isUploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
          } font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5`}
        >
          {isUploading ? "Uploading..." : "Select Image"}
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {previewUrl && (
        <div className="w-full flex flex-col gap-4">
          <div className="relative w-full max-w-md aspect-square mx-auto">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover rounded-lg"
            />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              className="w-full p-2 rounded-lg border border-gray-700 bg-background text-foreground"
              disabled={isUploading}
            />

            {exifData.captureDate && (
              <p className="text-sm text-gray-500">
                Captured: {new Date(exifData.captureDate).toLocaleString()}
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancel}
                disabled={isUploading}
                className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={isUploading}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
