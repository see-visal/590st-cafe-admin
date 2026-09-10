import { useGetCurrentUserQuery } from "./authApi";
import type { Role } from "./types";

/**
 * The API splits order handling into two mutually exclusive role scopes (SecurityConfig):
 *
 *   /api/admin/orders/**    hasRole("ADMIN")     — admins and super admins; 403 for baristas
 *   /api/barista/orders/**  hasRole("BARISTA")   — baristas only; 403 for admins
 *
 * Product, category and inventory reads overlap (`hasAnyRole("ADMIN","BARISTA")` on GET).
 * Screens that touch orders therefore have to pick their endpoint by role rather than
 * assuming one, which is what this hook is for.
 */
export function useCurrentRole() {
  const { data: user, isLoading } = useGetCurrentUserQuery();
  const role: Role | undefined = user?.role;

  return {
    role,
    isLoading,
    /** Super admin inherits every ADMIN authority, so it counts as an admin here. */
    isAdmin: role === "ADMIN" || role === "SUPER_ADMIN",
    isBarista: role === "BARISTA",
  };
}
