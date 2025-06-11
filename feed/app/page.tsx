"use client";

export const dynamic = "force-dynamic";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SignupForm from "./components/SignupForm";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      if (session?.user?.email) {
        try {
          // First try to get profile by email
          const response = await fetch(`/api/user?email=${session.user.email}`);
          if (response.ok) {
            const data = await response.json();
            if (data.profile) {
              setHasProfile(true);
              router.push(`/@${data.profile.username}`);
              return;
            }
          }
        } catch (error) {
          console.error("Error checking profile:", error);
        }
      }
      setIsLoading(false);
    };

    checkProfile();
  }, [session, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-8">Welcome to Scrolls.nyc</h1>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button
            onClick={() => signIn("google")}
            className="px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Sign up with Google
          </button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-gray-400">or</span>
            </div>
          </div>
          <button
            onClick={() => signIn("google")}
            className="px-6 py-3 rounded-lg border border-gray-700 text-white hover:bg-gray-800 transition-colors"
          >
            Log in with Google
          </button>
        </div>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="min-h-screen">
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => signOut()}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            title="Sign out"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
        <SignupForm />
      </div>
    );
  }

  return null;
}
