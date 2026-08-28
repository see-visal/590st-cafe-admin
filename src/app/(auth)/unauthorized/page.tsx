"use client";

import { ShieldAlert } from "lucide-react";
import { AuthShell, useLogout } from "@/features/auth";
import { AuthLogo } from "@/features/auth/components/auth-shell";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  const logout = useLogout();

  return (
    <AuthShell>
      <div>
        <AuthLogo />

        <div className="mt-8 grid size-11 place-items-center rounded-full bg-red-50 text-red-600">
          <ShieldAlert className="size-5" />
        </div>

        <h1 className="mt-5 text-xl font-semibold tracking-tight text-black">
          Access denied
        </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Your account needs the <span className="font-semibold">ADMIN</span>{" "}
          role to open this dashboard. Sign in with an admin account to
          continue.
        </p>

        <Button
          onClick={logout}
          className="mt-6 h-11 w-full rounded-lg bg-black text-sm font-semibold text-white transition-colors hover:bg-gray-900"
        >
          Back to login
        </Button>
      </div>
    </AuthShell>
  );
}
