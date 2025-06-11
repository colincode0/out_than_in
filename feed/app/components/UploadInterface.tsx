"use client";

import { useState } from "react";
import Image from "next/image";
import TextPost from "./TextPost";

interface UploadInterfaceProps {
  onImagePostComplete: (
    url: string,
    metadataTimestamp: string,
    caption?: string
  ) => void;
  onTextPostComplete: (post: {
    url: string;
    content: string;
    timestamp: string;
    type: "text";
  }) => void;
}

type UploadMode = "select" | "image" | "text";

export default function UploadInterface({
  onImagePostComplete,
  onTextPostComplete,
}: UploadInterfaceProps) {
  const [mode, setMode] = useState<UploadMode>("select");
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    metadataTimestamp: string;
    metadataUrl: string;
  } | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (caption.trim()) {
        formData.append("caption", caption.trim());
      }

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
      console.log("Upload response:", data);
      setSelectedImage({
        url: data.url,
        metadataTimestamp: data.metadataTimestamp,
        metadataUrl: data.metadataUrl,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload image";
      setError(errorMessage);
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleImagePost = () => {
    if (selectedImage) {
      onImagePostComplete(
        selectedImage.url,
        selectedImage.metadataTimestamp,
        caption.trim() || undefined
      );
      setSelectedImage(null);
      setCaption("");
      setMode("select");
    }
  };

  const handleBack = () => {
    setMode("select");
    setSelectedImage(null);
    setCaption("");
  };

  if (mode === "select") {
    return (
      <div className="flex flex-col gap-4 w-full max-w-md">
        <button
          onClick={() => setMode("image")}
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
        >
          Upload Image
        </button>
        <button
          onClick={() => setMode("text")}
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
        >
          Write Text Post
        </button>
      </div>
    );
  }

  if (mode === "image") {
    return (
      <div className="flex flex-col gap-4 w-full max-w-md">
        <button
          onClick={handleBack}
          className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
        >
          ← Back
        </button>

        {!selectedImage ? (
          <div className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] && handleImageSelect(e.target.files[0])
                }
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
                {uploading ? "Uploading..." : "Select Image"}
              </label>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption (optional)"
              className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square">
              <Image
                src={selectedImage.url}
                alt="Selected image"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption (optional)"
              className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
            <button
              onClick={handleImagePost}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            >
              Post Image
            </button>
          </div>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  }

  if (mode === "text") {
    return (
      <div className="flex flex-col gap-4 w-full max-w-md">
        <button
          onClick={handleBack}
          className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
        >
          ← Back
        </button>
        <TextPost
          onPostComplete={(post) => {
            onTextPostComplete(post);
            setMode("select");
          }}
        />
      </div>
    );
  }

  return null;
}
