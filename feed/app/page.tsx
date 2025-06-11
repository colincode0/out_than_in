"use client";

import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import UploadInterface from "./components/UploadInterface";
import { useState, useEffect } from "react";

interface Post {
  url: string;
  content?: string;
  timestamp: string;
  type: "text" | "image";
  uploadTimestamp?: string;
  exifTimestamp?: string | null;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleImagePost = (
    url: string,
    uploadTimestamp: string,
    exifTimestamp: string | null
  ) => {
    setPosts((prev) => [
      {
        url,
        timestamp: uploadTimestamp,
        uploadTimestamp,
        exifTimestamp,
        type: "image",
      },
      ...prev,
    ]);
  };

  const handleTextPost = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
  };

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center gap-4 mb-8">
          {status === "loading" ? (
            <div>Loading...</div>
          ) : session ? (
            <div className="flex flex-col items-center gap-4 w-full">
              <p>Signed in as {session.user?.email}</p>
              <UploadInterface
                onImagePostComplete={handleImagePost}
                onTextPostComplete={handleTextPost}
              />
              <button
                onClick={() => signOut()}
                className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            >
              Sign in with Google
            </button>
          )}
        </div>

        <div className="w-full">
          {isLoading ? (
            <div>Loading posts...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 w-full">
              {posts.map((post, index) => (
                <div key={index} className="border rounded-lg p-4">
                  {post.type === "text" ? (
                    <div className="flex flex-col gap-2">
                      <p className="whitespace-pre-wrap">{post.content}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(post.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="relative aspect-square">
                        <Image
                          src={post.url}
                          alt={`Uploaded image ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex flex-col gap-1 text-sm text-gray-500">
                        <p>
                          Posted:{" "}
                          {new Date(
                            post.uploadTimestamp || post.timestamp
                          ).toLocaleString()}
                        </p>
                        {post.exifTimestamp && (
                          <p>
                            Taken:{" "}
                            {new Date(post.exifTimestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div>No posts yet</div>
          )}
        </div>
      </main>
    </div>
  );
}
