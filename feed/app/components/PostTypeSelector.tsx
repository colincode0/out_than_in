"use client";

import { useState } from "react";
import ImageUpload from "./ImageUpload";
import TextPost from "./TextPost";
import { Post } from "@/app/types";

interface PostTypeSelectorProps {
  onPostComplete: (post: Post) => void;
}

type PostType = "image" | "text" | null;

export default function PostTypeSelector({
  onPostComplete,
}: PostTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<PostType>(null);

  if (selectedType === null) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-md">
        <button
          onClick={() => setSelectedType("image")}
          className="rounded-lg border border-gray-700 p-4 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Post Image
        </button>
        <button
          onClick={() => setSelectedType("text")}
          className="rounded-lg border border-gray-700 p-4 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Post Text
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <button
        onClick={() => setSelectedType(null)}
        className="mb-4 flex items-center gap-2 text-gray-400 hover:text-gray-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back
      </button>

      {selectedType === "image" ? (
        <ImageUpload onUploadComplete={onPostComplete} />
      ) : (
        <TextPost onPostComplete={onPostComplete} />
      )}
    </div>
  );
}
