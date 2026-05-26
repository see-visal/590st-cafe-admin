import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import { logoutRequest, refreshTokenRequest } from "./oidc";
import KeycloakProvider from "next-auth/providers/keycloak";
import { cookies } from "next/headers";

// Admin role configuration
const ADMIN_ROLES = ["ADMIN"];

// Helper function to validate admin role
async function validateAdminRole(accessToken: string): Promise<boolean> {
  try {
    // Decode JWT token to check roles
    const payload = JSON.parse(
      Buffer.from(accessToken.split(".")[1], "base64").toString()
    );

    const realmRoles = payload.realm_access?.roles || [];
    const clientRoles =
      payload.resource_access?.[process.env.KEYCLOAK_CLIENT_ID!]?.roles || [];
    const allRoles = [...realmRoles, ...clientRoles];

    const hasAdminRole = ADMIN_ROLES.some((adminRole) =>
      allRoles.includes(adminRole)
    );

    console.log(
      `🔐 Role check - User roles: ${allRoles.join(
        ", "
      )}, Is admin: ${hasAdminRole}`
    );
    return hasAdminRole;
  } catch (error) {
    console.error("❌ Error validating admin role:", error);
    return false;
  }
}

// Helper function to extract user info from token
function getUserInfoFromToken(accessToken: string) {
  try {
    const payload = JSON.parse(
      Buffer.from(accessToken.split(".")[1], "base64").toString()
    );
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      roles: [
        ...(payload.realm_access?.roles || []),
        ...(payload.resource_access?.[process.env.KEYCLOAK_CLIENT_ID!]?.roles ||
          []),
      ],
    };
  } catch (error) {
    console.error("❌ Error extracting user info from token:", error);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
      authorization: {
        params: {
          scope: "openid email profile roles", // Added roles scope
          prompt: "login",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ account }) {
      try {
        if (!account?.access_token) {
          console.error("❌ No access token during sign-in");
          return false;
        }

        // Validate user has admin role
        const hasAdminRole = await validateAdminRole(account.access_token);

        if (!hasAdminRole) {
          console.log("🚫 Access denied - User is not an admin");
          return "/auth/unauthorized";
        }

        console.log("✅ Admin user authenticated successfully");
        return true;
      } catch (error) {
        console.error("❌ Sign-in validation error:", error);
        return "/auth/error";
      }
    },

    async jwt({ token, account }): Promise<JWT> {
      const now = Math.floor(Date.now() / 1000);

      if (account) {
        console.log("✨ Initial login - storing tokens");

        // Validate admin role on initial login
        const hasAdminRole = await validateAdminRole(
          account.access_token as string
        );

        if (!hasAdminRole) {
          console.error("❌ Admin role validation failed during JWT creation");
          throw new Error("AccessDenied");
        }

        const expiresIn =
          typeof account.expires_in === "number"
            ? account.expires_in
            : parseInt(String(account.expires_in || "300"), 10);

        const expiresAt = now + expiresIn;

        // Extract user info from token
        const userInfo = getUserInfoFromToken(account.access_token as string);

        console.log("📊 Initial token details:");
        console.log(
          `   Access token: ${(account.access_token as string).substring(
            0,
            30
          )}...`
        );
        console.log(`   User: ${userInfo?.email}`);
        console.log(`   Roles: ${userInfo?.roles?.join(", ")}`);
        console.log(`   Expires in: ${expiresIn} seconds`);
        console.log(
          `   Expires at: ${new Date(expiresAt * 1000).toISOString()}`
        );

        const cookieStore = await cookies();
        const cookieName = "accessToken-Cambo";
        const accessToken = account.access_token as string;

        if (accessToken) {
          cookieStore.set(cookieName, accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: expiresIn,
          });
        }

        return {
          ...token,
          access_token: account.access_token as string,
          refresh_token: account.refresh_token as string,
          expires_at: expiresAt,
          user: userInfo,
        } as JWT;
      }

      const expiresAt = token.expires_at as number;
      const timeUntilExpiry = expiresAt - now;

      console.log("🔍 Token status check:");
      console.log(`   Current time: ${new Date(now * 1000).toISOString()}`);
      console.log(
        `   Token expires: ${new Date(expiresAt * 1000).toISOString()}`
      );
      console.log(`   Time until expiry: ${timeUntilExpiry} seconds`);

      const shouldRefresh = timeUntilExpiry < 60;

      if (!shouldRefresh) {
        console.log("✅ Token still valid, no refresh needed");
        return token;
      }

      console.log("⚠️  Token expiring soon, initiating refresh...");
      console.log(
        `   Refresh token: ${(token.refresh_token as string)?.substring(
          0,
          30
        )}...`
      );

      try {
        const refreshed = await refreshTokenRequest(
          token.refresh_token as string
        );

        if (!refreshed.access_token) {
          console.error("❌ No access token in refresh response");
          throw new Error("No access token received");
        }

        // Re-validate admin role after refresh
        const hasAdminRole = await validateAdminRole(refreshed.access_token);
        if (!hasAdminRole) {
          console.error("❌ Admin role validation failed after token refresh");
          throw new Error("AccessDenied");
        }

        const newExpiresIn =
          typeof refreshed.expires_in === "number"
            ? refreshed.expires_in
            : parseInt(String(refreshed.expires_in || "300"), 10);

        const newExpiresAt = now + newExpiresIn;

        // Update user info from new token
        const userInfo = getUserInfoFromToken(refreshed.access_token);

        console.log("✅ Token refreshed successfully!");
        console.log("📊 New token details:");
        console.log(
          `   New access token: ${refreshed.access_token.substring(0, 30)}...`
        );
        console.log(
          `   New refresh token: ${
            refreshed.refresh_token?.substring(0, 30) ||
            "SAME AS BEFORE (not rotated)"
          }...`
        );
        console.log(`   User: ${userInfo?.email}`);
        console.log(`   Expires in: ${newExpiresIn} seconds`);
        console.log(
          `   New expiry time: ${new Date(newExpiresAt * 1000).toISOString()}`
        );

        // Update the cookie with new access token
        const cookieStore = await cookies();
        const cookieName = "accessToken-Cambo";

        cookieStore.set(cookieName, refreshed.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: newExpiresIn,
        });

        return {
          ...token,
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token || token.refresh_token,
          expires_at: newExpiresAt,
          user: userInfo,
        } as JWT;
      } catch (error) {
        console.error("❌ Token refresh failed:", error);
        console.error(
          "   Error details:",
          error instanceof Error ? error.message : error
        );

        return {
          ...token,
          error: "RefreshAccessTokenError",
        } as JWT;
      }
    },

    async session({ session, token }) {
      session.access_token = token.access_token as string;
      session.refresh_token = token.refresh_token as string;
      session.error = token.error as string | undefined;

      // Add user roles to session
      if (token.user) {
        session.user = {
          ...session.user,
          id: token.user?.id,
          roles: token.user?.roles ?? [],
        };
      }

      return session;
    },
  },

  events: {
    async signOut({ token }) {
      console.log("👋 Sign out event triggered");

      // Clear the access token cookie
      try {
        const cookieStore = await cookies();
        const cookieName = "accessToken-Cambo";
        cookieStore.delete(cookieName);
        console.log("✅ Access token cookie cleared");
      } catch (error) {
        console.error("❌ Error clearing access token cookie:", error);
      }

      if (token?.refresh_token) {
        logoutRequest(token.refresh_token as string)
          .then(() => console.log("✅ Successfully logged out from Keycloak"))
          .catch((error) => console.error("❌ Keycloak logout failed:", error));
      }
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 10 * 60 * 60,
  },

  pages: {
    error: "/auth/error",
    signIn: "/auth/unauthorized", // Custom unauthorized page for non-admin users
  },

  debug: process.env.NODE_ENV === "development",
};

// TypeScript declarations
declare module "next-auth" {
  interface Session {
    access_token: string;
    refresh_token: string;
    error?: string;
    user: {
      id?: string;
      name?: string;
      email?: string;
      image?: string;
      roles: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    error?: string;
    user?: {
      id: string;
      email: string;
      name: string;
      roles: string[];
    };
  }
}
