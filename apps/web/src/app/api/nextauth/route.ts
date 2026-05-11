// apps/web/src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { refreshAccessToken } from "@/lib/api/auth";

const handler = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!, // docvault-web
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!, // docvault-web-secret
      issuer: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
    }),
  ],

  callbacks: {
    // ─── Persist tokens in the JWT ───────────────────────────────────────
    async jwt({ token, account }) {
      // First sign-in: account object is available
      if (account) {
        return {
          ...token,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          expires_at: account.expires_at, // epoch seconds
        };
      }

      // Token still valid
      if (Date.now() < (token.expires_at as number) * 1000) {
        return token;
      }

      // Token expired — refresh via your NestJS backend
      try {
        const refreshed = await refreshAccessToken(
          token.refresh_token as string,
        );
        return {
          ...token,
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + refreshed.expires_in,
        };
      } catch {
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },

    // ─── Expose access_token to the client session ───────────────────────
    async session({ session, token }) {
      session.access_token = token.access_token as string;
      session.error = token.error as string | undefined;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
