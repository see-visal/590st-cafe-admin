"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, LogOut, RotateCcw, ShieldAlert, WifiOff } from "lucide-react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { LogoMark } from "@/components/common/AdminKit";
import { apiErrorMessage } from "@/store/api/baseApi";
import { useGetCurrentUserQuery, useLogoutMutation } from "@/store/api/authApi";
import { adminHome, canAccessAdminPage } from "@/lib/adminAccess";
import { clearTokens, isAuthenticated } from "@/lib/authStorage";
import { useMounted } from "@/hooks/useMounted";

const AUTO_RETRY_MS = 5000;

function statusOf(error: unknown): number | string | undefined {
  return (error as FetchBaseQueryError | undefined)?.status;
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useMounted();
  const checked = mounted && isAuthenticated();
  const profile = useGetCurrentUserQuery(undefined, { skip: !checked });
  const home = adminHome(profile.data?.role);

  const status = statusOf(profile.error);
  const hasAccount = profile.data !== undefined;
  const serverUnreachable =
    status === "FETCH_ERROR" ||
    status === "TIMEOUT_ERROR" ||
    status === 502 ||
    status === 503 ||
    status === 504;

  const loginUrl = `/auth/login?next=${encodeURIComponent(pathname ?? "/")}`;

  useEffect(() => {
    if (mounted && !checked) router.replace(loginUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, checked, router, pathname]);

  useEffect(() => {
    if (
      profile.data?.role === "BARISTA" &&
      (pathname === "/" || pathname === "/dashboard")
    )
      router.replace(home);
  }, [profile.data?.role, pathname, router, home]);

  useEffect(() => {
    if (!hasAccount && status === 401) {
      clearTokens();
      router.replace(loginUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAccount, status]);

  useEffect(() => {
    if (hasAccount || !serverUnreachable || profile.isFetching) return;
    const timer = setTimeout(() => void profile.refetch(), AUTO_RETRY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAccount, serverUnreachable, profile.isFetching]);

  if (hasAccount) {
    if (!canAccessAdminPage(profile.data?.role, pathname)) {
      const isCustomer = profile.data?.role === "CUSTOMER";
      return (
        <GuardCard
          icon={<ShieldAlert className="h-7 w-7 text-amber-600" />}
          title={
            isCustomer
              ? "This is a customer account"
              : "This page needs a different staff role"
          }
          message={
            isCustomer
              ? "Customer accounts can't open the staff dashboard. Sign in with an admin or barista account."
              : "Your account doesn't have access to this page."
          }
        >
          {isCustomer ? (
            <SignOutButton primary />
          ) : (
            <Link href={home} className="btn_primary_black">
              Back to your dashboard
            </Link>
          )}
        </GuardCard>
      );
    }
    return <>{children}</>;
  }

  if (
    !checked ||
    profile.isUninitialized ||
    profile.isFetching ||
    !profile.error ||
    status === 401
  ) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f5f5f3]">
        <LogoMark />
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <GuardCard
      icon={
        serverUnreachable ? (
          <WifiOff className="h-7 w-7 text-red-500" />
        ) : (
          <ShieldAlert className="h-7 w-7 text-red-500" />
        )
      }
      title={
        serverUnreachable
          ? "Can't reach the server"
          : "We couldn't load your account"
      }
      message={
        serverUnreachable
          ? "The system is unavailable right now. This page will try again automatically."
          : apiErrorMessage(
              profile.error as FetchBaseQueryError,
              "Something went wrong while loading your account.",
            )
      }
    >
      <button
        type="button"
        className="btn_primary_black"
        onClick={() => profile.refetch()}
      >
        <RotateCcw />
        Try again
      </button>
      <SignOutButton />
    </GuardCard>
  );
}

function GuardCard({
  icon,
  title,
  message,
  children,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5f3] px-4">
      <div
        role="alert"
        className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm"
      >
        <div className="flex justify-center">
          <LogoMark />
        </div>
        <div className="mx-auto mt-8 grid h-14 w-14 place-items-center rounded-full bg-gray-100">
          {icon}
        </div>
        <h1 className="mt-5 text-lg font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {children}
        </div>
      </div>
    </main>
  );
}

function SignOutButton({ primary = false }: { primary?: boolean }) {
  const [logout, { isLoading }] = useLogoutMutation();
  return (
    <button
      type="button"
      className={primary ? "btn_primary_black" : "btn_outline_black"}
      disabled={isLoading}
      onClick={async () => {
        try {
          await logout().unwrap();
        } catch {
        }
        window.location.href = "/auth/login";
      }}
    >
      {isLoading ? <Loader2 className="animate-spin" /> : <LogOut />}
      Sign out
    </button>
  );
}
