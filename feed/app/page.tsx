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
  metadataTimestamp?: string;
  caption?: string;
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
    if (session) {
      fetchPosts();
    }
  }, [session]);

  const handleImagePost = (
    url: string,
    metadataTimestamp: string,
    caption?: string
  ) => {
    setPosts((prev) => [
      {
        url,
        timestamp: new Date().toISOString(),
        type: "image",
        metadataTimestamp,
        caption,
      },
      ...prev,
    ]);
  };

  const handleTextPost = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-4xl">
        <div className="flex flex-col items-center gap-4 w-full">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />

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

        {session && (
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
                          <p className="absolute bottom-2 right-2 text-sm text-white bg-black/50 px-2 py-1 rounded">
                            {post.metadataTimestamp
                              ? new Date(
                                  post.metadataTimestamp
                                ).toLocaleString()
                              : new Date(post.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {post.caption && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {post.caption}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div>No posts yet</div>
            )}
          </div>
        )}

        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
              app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
