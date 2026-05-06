// apps/web/src/lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import KeycloakProvider from 'next-auth/providers/keycloak';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    refreshToken: string;
    idToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      organizationId: string;
      role: string;
    };
    error?: string;
  }
}

async function refreshAccessToken(token: any) {
  try {
    const url = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.KEYCLOAK_CLIENT_ID!,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
        refresh_token: token.refreshToken,
      }),
    });

    const refreshed = await response.json();

    if (!response.ok) throw refreshed;

    return {
      ...token,
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
    };
  } catch (error) {
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`,
      authorization: {
        params: {
          scope: 'openid email profile',
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account, profile }) {
      // Initial sign in
      if (account && profile) {
        return {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          idToken: account.id_token,
          accessTokenExpires: account.expires_at! * 1000,
          user: {
            id: profile.sub,
            email: profile.email,
            name: profile.name,
            image: (profile as any).picture,
          },
        };
      }

      // Return token if not expired
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Refresh the token
      return refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.idToken = token.idToken as string;
      session.user = token.user as any;
      session.error = token.error as string;
      return session;
    },
  },

  events: {
    async signOut({ token }) {
      // Logout from Keycloak
      const logoutUrl = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout`;
      await fetch(logoutUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.KEYCLOAK_CLIENT_ID!,
          client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
          refresh_token: (token.refreshToken as string) || '',
        }),
      });
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};