"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { UserProfile } from "@/app/types";

interface ProfileHeaderProps {
  profile: UserProfile;
  onProfileUpdate?: () => void;
  following: number;
  isFollowing: boolean;
}

export default function ProfileHeader({
  profile,
  onProfileUpdate,
  following,
  isFollowing: initialIsFollowing,
}: ProfileHeaderProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(profile.bio);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const isOwnProfile = session?.user?.email === profile.email;

  const handleFollow = async () => {
    if (!session?.user?.email) return;
    setIsFollowLoading(true);
    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: isFollowing ? "unfollow" : "follow",
          targetUsername: profile.username,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update following status");
      }

      setIsFollowing(!isFollowing);
      onProfileUpdate?.();
    } catch (err) {
      console.error("Error updating following status:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update following status"
      );
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bio,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setIsEditing(false);
      onProfileUpdate?.();
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 p-6 bg-background border border-gray-800 rounded-lg">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-700 bg-background text-foreground resize-none min-h-[100px]"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setBio(profile.bio);
              }}
              className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">@{profile.username}</h1>
              <div className="mt-2 text-sm text-gray-400">
                <span>{following} following</span>
              </div>
            </div>
            <div className="flex gap-2">
              {!isOwnProfile && session?.user?.email && (
                <button
                  onClick={handleFollow}
                  disabled={isFollowLoading}
                  className={`px-4 py-2 rounded-lg ${
                    isFollowing
                      ? "border border-gray-700 hover:bg-gray-800 text-gray-300"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isFollowLoading
                    ? "Loading..."
                    : isFollowing
                    ? "Unfollow"
                    : "Follow"}
                </button>
              )}
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-full hover:bg-gray-800 transition-colors"
                  title="Edit profile"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
          {profile.bio && (
            <p className="text-gray-300 whitespace-pre-wrap">{profile.bio}</p>
          )}
        </div>
      )}
    </div>
  );
}
