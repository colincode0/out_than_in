import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import { UserProfile } from "@/app/types";

export async function GET() {
  try {
    // Get total number of users and posts in parallel
    const [userKeys, postKeys] = await Promise.all([
      kv.keys("username:*:profile"),
      kv.keys("post:*"),
    ]);

    const totalUsers = userKeys.length;
    const totalPosts = postKeys.length;

    // Get top 5 most followed accounts efficiently
    // First, get all user profiles
    const userProfiles = await Promise.all(
      userKeys.map(async (key) => {
        const profile = await kv.get<UserProfile>(key);
        if (!profile) return null;
        return { key, profile };
      })
    );

    // Filter out null profiles
    const validProfiles = userProfiles.filter(
      (item): item is { key: string; profile: UserProfile } => item !== null
    );

    // Get follower counts for all users in parallel
    const userStats = await Promise.all(
      validProfiles.map(async ({ key, profile }) => {
        const username = key.split(":")[1];
        const followers = await kv.smembers(`user:${profile.email}:followers`);

        return {
          username,
          displayName: profile.displayName,
          followerCount: followers.length,
          profilePicture: profile.profilePicture,
        };
      })
    );

    // Sort by follower count and get top 5
    const topFollowedAccounts = userStats
      .sort((a, b) => b.followerCount - a.followerCount)
      .slice(0, 5);

    return NextResponse.json({
      totalUsers,
      totalPosts,
      topFollowedAccounts,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics data" },
      { status: 500 }
    );
  }
}
