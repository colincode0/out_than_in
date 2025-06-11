export interface PostMetadata {
  id: string;
  url: string;
  caption?: string;
  captureDate: string | null;
  postDate: string;
  type: "image" | "text";
  content?: string;
  hidden: boolean;
}

export interface TextPost extends PostMetadata {
  type: "text";
  content: string;
}

export interface ImagePost extends PostMetadata {
  type: "image";
  caption?: string;
}

export type Post = TextPost | ImagePost;
