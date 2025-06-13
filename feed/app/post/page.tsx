"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PostTypeSelector from "@/app/components/PostTypeSelector";

export default function PostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  if (!session?.user?.email) {
    return null;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto mt-12">
        <h1 className="text-2xl font-bold mb-8">Create Post</h1>
        <div className="flex justify-center">
          <PostTypeSelector
            onPostComplete={(post) => {
              if (post.type === "text") {
                router.push(`/${post.username}?viewMode=text`);
              } else {
                router.push("/");
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
