"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useLogout } from "@/features/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SidebarUserProps {
  name: string;
  role: string;
}

export function SidebarUser({ name, role }: SidebarUserProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const logout = useLogout();

  return (
    <>
      <div className="sidebar_user flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
          {name.slice(0, 1).toUpperCase()}
        </div>
        <div className="sidebar_user_text min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{name}</p>
          <p className="truncate text-xs text-white/65">{role}</p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          aria-label="Log out"
          title="Log out"
          className="sidebar_user_logout grid size-8 shrink-0 cursor-pointer place-items-center rounded-md text-white/60 transition-colors hover:bg-white/10 hover:text-[#befe35]"
        >
          <LogOut className="size-4" />
        </button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to get back into the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={logout}
              className="bg-black text-white hover:bg-gray-900"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
