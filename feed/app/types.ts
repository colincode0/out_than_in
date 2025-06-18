export interface BasePost {
  id: string;
  type: "image" | "text";
  username: string;
  userEmail: string;
  postDate: string;
  hidden: boolean;
  commentCount?: number;
}

export interface ImagePost extends BasePost {
  type: "image";
  url: string;
  caption?: string;
  captureDate: string | null;
}

export interface TextPost extends BasePost {
  type: "text";
  content: string;
}

export type Post = ImagePost | TextPost;

export interface UserProfile {
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  profilePicture?: string;
  createdAt: string;
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  username: string;
  userEmail: string;
  content: string;
  createdAt: string;
}

declare module "next-auth" {
  interface Session {
    user?: {
      email?: string | null;
      name?: string | null;
      image?: string | null;
      id?: string;
    };
  }
}
