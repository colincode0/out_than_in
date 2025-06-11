import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import { UserProfile } from "@/app/types";

export async function GET() {
  try {
    // Get all usernames from the username:profile keys
    const keys = await kv.keys("username:*:profile");
    console.log("Found user keys:", keys);

    if (!keys.length) {
      console.log("No users found in KV store");
      return NextResponse.json({
        users: [],
      });
    }

    // Convert users object to array and calculate stats
    const userStats = await Promise.all(
      keys.map(async (key) => {
        const profile = await kv.get<UserProfile>(key);
        if (!profile) return null;

        const username = key.split(":")[1];
        const followers = await kv.smembers(`user:${profile.email}:followers`);

        return {
          username,
          followerCount: followers.length,
          displayName: profile.displayName,
        };
      })
    );

    // Filter out null values and sort by follower count
    const sortedUsers = userStats
      .filter((user): user is NonNullable<typeof user> => user !== null)
      .sort((a, b) => b.followerCount - a.followerCount)
      .slice(0, 50); // Show top 50 users

    console.log("Final sorted users:", sortedUsers);

    return NextResponse.json({
      users: sortedUsers,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard data" },
      { status: 500 }
    );
  }
}
