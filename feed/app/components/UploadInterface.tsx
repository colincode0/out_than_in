"use client";

import TextPost from "./TextPost";
import ImageUpload from "./ImageUpload";

interface Post {
  url: string;
  content?: string;
  timestamp: string;
  type: "text" | "image";
  uploadTimestamp?: string;
  exifTimestamp?: string | null;
}

interface UploadInterfaceProps {
  onImagePostComplete: (
    url: string,
    uploadTimestamp: string,
    exifTimestamp: string | null
  ) => void;
  onTextPostComplete: (post: Post) => void;
}

export default function UploadInterface({
  onImagePostComplete,
  onTextPostComplete,
}: UploadInterfaceProps) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <ImageUpload onUploadComplete={onImagePostComplete} />
      <TextPost onPostComplete={onTextPostComplete} />
    </div>
  );
}
