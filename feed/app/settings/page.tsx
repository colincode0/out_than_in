"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { UserProfile } from "@/app/types";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/user?email=${session.user.email}`);
          if (response.ok) {
            const data = await response.json();
            setProfile(data.profile);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
    };

    fetchProfile();
  }, [session]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    try {
      setIsUploading(true);

      // Upload the image
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "profile");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload profile picture");
      }

      const data = await response.json();

      // Update profile with new picture URL
      const updateResponse = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profilePicture: data.url,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update profile picture");
      }

      // Refresh profile data
      const updatedResponse = await fetch(
        `/api/user?email=${session?.user?.email}`
      );
      if (updatedResponse.ok) {
        const profileData = await updatedResponse.json();
        setProfile(profileData.profile);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      setError(
        err instanceof Error ? err.message : "Failed to upload profile picture"
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!session?.user?.email) {
    return null;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 mt-12">Settings</h1>

        <div className="space-y-6">
          <div className="bg-background border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>

            {/* Profile Picture */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Profile Picture</h3>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 bg-gray-800">
                  {profile?.profilePicture ? (
                    <Image
                      src={profile.profilePicture}
                      alt="Profile picture"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800" />
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                    className="hidden"
                    id="profile-picture-upload"
                  />
                  <label
                    htmlFor="profile-picture-upload"
                    className={`cursor-pointer rounded-lg border border-gray-700 px-4 py-2 ${
                      isUploading
                        ? "bg-gray-700 cursor-not-allowed"
                        : "hover:bg-gray-800"
                    }`}
                  >
                    {isUploading ? "Uploading..." : "Change Picture"}
                  </label>
                </div>
              </div>
              {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
