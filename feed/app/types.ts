export interface BasePost {
  id: string;
  type: "image" | "text";
  username: string;
  userEmail: string;
  postDate: string;
  hidden: boolean;
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
  username: string;
  email: string;
  displayName: string;
  bio?: string;
  createdAt: string;
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
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
