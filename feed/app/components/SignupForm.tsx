"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    const checkUsername = async () => {
      if (!username.trim()) {
        setIsUsernameAvailable(null);
        return;
      }

      // Don't check availability if username is too short
      if (username.trim().length < 5) {
        setIsUsernameAvailable(null);
        return;
      }

      setIsCheckingUsername(true);
      try {
        const response = await fetch(`/api/user?username=${username}`);
        if (response.status === 404) {
          setIsUsernameAvailable(true);
        } else {
          setIsUsernameAvailable(false);
        }
      } catch (err) {
        console.error("Error checking username:", err);
        setIsUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          bio,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create profile");
      }

      const data = await response.json();
      router.push(`/@${data.username}`);
    } catch (err) {
      console.error("Error creating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to create profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session?.user?.email) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-background border border-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Complete Your Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-2">
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className={`w-full p-2 rounded-lg border ${
                username.trim().length > 0 && username.trim().length < 5
                  ? "border-red-500"
                  : isUsernameAvailable === false
                  ? "border-red-500"
                  : isUsernameAvailable === true
                  ? "border-green-500"
                  : "border-gray-700"
              } bg-background text-foreground`}
              required
              minLength={5}
              pattern="^[a-zA-Z0-9_]+$"
              title="Username must be at least 5 characters and can only contain letters, numbers, and underscores"
            />
            {isCheckingUsername && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-white rounded-full"></div>
              </div>
            )}
          </div>
          {username.trim().length > 0 && username.trim().length < 5 && (
            <p className="text-red-500 text-sm mt-1">
              Username must be at least 5 characters
            </p>
          )}
          {isUsernameAvailable === false && (
            <p className="text-red-500 text-sm mt-1">
              This username is already taken
            </p>
          )}
          {isUsernameAvailable === true && (
            <p className="text-green-500 text-sm mt-1">
              This username is available
            </p>
          )}
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            className="w-full p-2 rounded-lg border border-gray-700 bg-background text-foreground resize-none min-h-[100px]"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={
            isSubmitting ||
            !username.trim() ||
            username.trim().length < 5 ||
            isCheckingUsername ||
            isUsernameAvailable === false
          }
          className="w-full py-2 px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Creating Profile..." : "Complete Signup"}
        </button>
      </form>
    </div>
  );
}
