import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/app/auth";
import { kv } from "@vercel/kv";
import { UserProfile, UserSettings } from "@/app/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const email = searchParams.get("email");

    if (!username && !email) {
      return NextResponse.json(
        { error: "Username or email is required" },
        { status: 400 }
      );
    }

    let profile: UserProfile | null = null;

    // Try to get profile by username if provided
    if (username) {
      profile = await kv.get<UserProfile>(`username:${username}:profile`);
    }

    // If no profile found by username and email is provided, try email
    if (!profile && email) {
      profile = await kv.get<UserProfile>(`user:${email}:profile`);
    }

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get following and followers counts
    const following = await kv.smembers(`user:${profile.email}:following`);
    const followers = await kv.smembers(`user:${profile.email}:followers`);

    // Only fetch settings if user is authenticated and viewing their own profile
    const session = await getServerSession(authConfig);
    let settings = null;
    let isFollowing = false;

    if (session?.user?.email) {
      if (session.user.email === profile.email) {
        settings = await kv.get<UserSettings>(`user:${profile.email}:settings`);
      } else {
        // Check if the current user is following this profile
        isFollowing =
          (await kv.sismember(
            `user:${session.user.email}:following`,
            profile.username
          )) === 1;
      }
    }

    return NextResponse.json({
      profile,
      settings,
      following: following.length,
      followers: followers.length,
      isFollowing,
    });
  } catch (error) {
    console.error("Error in GET /api/user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { username, bio } = await request.json();
    const email = session.user.email;
    const now = new Date().toISOString();

    // Check for reserved usernames
    const reservedUsernames = ["explore", "leaderboard", "feed"];
    if (reservedUsernames.includes(username.toLowerCase())) {
      return NextResponse.json(
        { error: "This username is reserved" },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const existingProfile = await kv.get<UserProfile>(
      `username:${username}:profile`
    );
    if (existingProfile) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    // Create or update profile
    const profile: UserProfile = {
      email,
      username,
      displayName: username,
      bio: bio || "",
      createdAt: now,
    };

    // Create default settings if they don't exist
    const existingSettings = await kv.get<UserSettings>(
      `user:${email}:settings`
    );
    if (!existingSettings) {
      const settings: UserSettings = {
        theme: "dark",
        emailNotifications: true,
      };
      await kv.set(`user:${email}:settings`, settings);
    }

    // Store profile with both email and username keys for easy lookup
    await kv.set(`user:${email}:profile`, profile);
    await kv.set(`username:${username}:profile`, profile);

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error in POST /api/user:", error);
    return NextResponse.json(
      { error: "Failed to create/update profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { bio, settings } = await request.json();
    const email = session.user.email;

    // Update profile if provided
    if (bio) {
      const existingProfile = await kv.get<UserProfile>(
        `user:${email}:profile`
      );
      if (!existingProfile) {
        return NextResponse.json(
          { error: "Profile not found" },
          { status: 404 }
        );
      }

      const updatedProfile: UserProfile = {
        ...existingProfile,
        bio: bio || existingProfile.bio,
      };

      // Update both email and username keys
      await kv.set(`user:${email}:profile`, updatedProfile);
      await kv.set(
        `username:${existingProfile.username}:profile`,
        updatedProfile
      );
    }

    // Update settings if provided
    if (settings) {
      const existingSettings = await kv.get<UserSettings>(
        `user:${email}:settings`
      );
      if (!existingSettings) {
        return NextResponse.json(
          { error: "Settings not found" },
          { status: 404 }
        );
      }

      const updatedSettings: UserSettings = {
        ...existingSettings,
        ...settings,
      };

      await kv.set(`user:${email}:settings`, updatedSettings);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PATCH /api/user:", error);
    return NextResponse.json(
      { error: "Failed to update user data" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { action, targetUsername } = await request.json();
    if (!action || !targetUsername) {
      return NextResponse.json(
        { error: "Action and target username are required" },
        { status: 400 }
      );
    }

    // Get target user's profile to get their email
    const targetProfile = await kv.get<UserProfile>(
      `username:${targetUsername}:profile`
    );
    if (!targetProfile) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    if (action === "follow") {
      // Add to current user's following
      await kv.sadd(`user:${session.user.email}:following`, targetUsername);
      // Add to target user's followers
      await kv.sadd(
        `user:${targetProfile.email}:followers`,
        session.user.email
      );
    } else if (action === "unfollow") {
      // Remove from current user's following
      await kv.srem(`user:${session.user.email}:following`, targetUsername);
      // Remove from target user's followers
      await kv.srem(
        `user:${targetProfile.email}:followers`,
        session.user.email
      );
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PUT /api/user:", error);
    return NextResponse.json(
      { error: "Failed to update following status" },
      { status: 500 }
    );
  }
}
