import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { User } from "next-auth";

const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: User }) {
      // For now, allow any Google account to sign in
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },
  trustHost: true,
  basePath: "/api/auth",
  baseUrl: NEXTAUTH_URL,
  url: NEXTAUTH_URL,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authConfig);
export { handler as GET, handler as POST };
