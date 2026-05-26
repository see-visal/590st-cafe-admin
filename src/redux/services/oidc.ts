const BASE_URL = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect`;

const oidcFetch = async (endpoint: string, body: URLSearchParams) => {
  console.log(`🌐 OIDC Request: ${endpoint}`);

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ OIDC ${endpoint} failed:`, {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
    });
    throw new Error(
      `OIDC ${endpoint} failed: ${response.status} - ${errorText}`
    );
  }

  return response.json();
};

// Handle refresh token request
export const refreshTokenRequest = async (refresh_token: string) => {
  console.log("🔄 Initiating token refresh...");
  console.log(`   Refresh token: ${refresh_token.substring(0, 30)}...`);

  const response = await oidcFetch(
    "/token",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
      client_id: process.env.KEYCLOAK_CLIENT_ID!,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
    })
  );

  console.log("📦 Refresh response received:");
  console.log(`   Has access token: ${!!response.access_token}`);
  console.log(`   Has refresh token: ${!!response.refresh_token}`);
  console.log(`   Access token expires in: ${response.expires_in}s`);
  console.log(`   Refresh token expires in: ${response.refresh_expires_in}s`);

  // With "Revoke Refresh Token: OFF", Keycloak might not send a new refresh token
  // This is NORMAL and EXPECTED behavior
  if (!response.refresh_token) {
    console.log(
      "ℹ️  No new refresh token provided (using existing one - this is normal)"
    );
  }

  return response;
};

// Handle logout request
export const logoutRequest = async (refresh_token: string) => {
  console.log("🚪 Logging out from Keycloak...");
  console.log(`   Refresh token: ${refresh_token.substring(0, 30)}...`);

  return oidcFetch(
    "/logout",
    new URLSearchParams({
      refresh_token,
      client_id: process.env.KEYCLOAK_CLIENT_ID!,
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
    })
  );
};
