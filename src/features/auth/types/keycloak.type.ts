// types/keycloak.ts
import { JWT } from "next-auth/jwt";

export interface KeycloakJWT extends JWT {
  realm_access?: {
    roles?: string[];
  };
}
