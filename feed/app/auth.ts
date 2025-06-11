import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { User } from "next-auth";

const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: User }) {
      return user.email === process.env.ADMIN_EMAIL;
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
};

const handler = NextAuth(authConfig);
export { handler as GET, handler as POST };
