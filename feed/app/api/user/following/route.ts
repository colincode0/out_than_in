import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { UserProfile } from "@/app/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Get the user's profile to get their email
    const profile = await kv.get<UserProfile>(`username:${username}:profile`);
    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the list of usernames the user is following
    const followingUsernames = await kv.smembers(
      `user:${profile.email}:following`
    );

    // Get the profiles for each followed user
    const followingProfiles = await Promise.all(
      followingUsernames.map(async (username) => {
        const profile = await kv.get<UserProfile>(
          `username:${username}:profile`
        );
        return profile;
      })
    );

    // Filter out any null profiles (in case a followed user was deleted)
    const validProfiles = followingProfiles.filter(
      (profile): profile is UserProfile => profile !== null
    );

    return NextResponse.json({
      following: validProfiles,
    });
  } catch (error) {
    console.error("Error in GET /api/user/following:", error);
    return NextResponse.json(
      { error: "Failed to fetch following list" },
      { status: 500 }
    );
  }
}
