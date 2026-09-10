"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useGetCurrentUserQuery } from "@/store/api/authApi";
import { adminHome, canAccessAdminPage } from "@/lib/adminAccess";

import { isAuthenticated } from "@/lib/authStorage";

/**
 * Client-side gate for the admin area.
 *
 * The session is a JWT pair in localStorage, which Next's server middleware cannot read — so
 * the check has to run in the browser. This is a redirect for convenience, not a security
 * boundary: every admin endpoint is authorised server-side, and baseApi force-logs-out on a
 * 401 that a refresh cannot rescue.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const profile = useGetCurrentUserQuery(undefined, { skip: !checked });
  const home = adminHome(profile.data?.role);

  useEffect(() => {
    if (isAuthenticated()) {
      setChecked(true);
      return;
    }
    // Come back here once signed in.
    const next = encodeURIComponent(pathname ?? "/");
    router.replace(`/auth/login?next=${next}`);
  }, [router, pathname]);

  useEffect(() => {
    if (profile.data?.role === "BARISTA" && (pathname === "/" || pathname === "/dashboard")) router.replace(home);
  }, [profile.data?.role, pathname, router, home]);

  if (!checked || profile.isLoading || profile.isUninitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (profile.error) return <div className="p-8" role="alert">
    <p>Could not load your account.</p>
    <button type="button" className="mt-3 underline" onClick={() => profile.refetch()}>Retry</button>
  </div>;

  if (!canAccessAdminPage(profile.data?.role, pathname)) return <div className="p-8">
    <h1 className="text-xl font-semibold">This page requires a different staff role</h1>
    <p className="mt-2">{profile.data?.role === "CUSTOMER" ? "Customer accounts cannot access the staff dashboard." : "Your account does not have access to this page."}</p>
    <Link className="mt-4 inline-block underline" href={profile.data?.role === "CUSTOMER" ? "/auth/login" : home}>
      {profile.data?.role === "CUSTOMER" ? "Sign in with a staff account" : "Back to your dashboard"}
    </Link>
  </div>;

  return <>{children}</>;
}
