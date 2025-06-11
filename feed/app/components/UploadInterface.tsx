"use client";

import TextPost from "./TextPost";
import ImageUpload from "./ImageUpload";
import { Post } from "@/app/types";

interface UploadInterfaceProps {
  onImagePostComplete: (post: Post) => void;
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
