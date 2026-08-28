"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Auth chrome ported from Coffee-Shop-UI: the form on the left, the campaign
 * slideshow on the right, stacking below `lg`.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="login_page_wrapper">
      <div className="login_form_side">
        <div className="flex justify-start">
          <Link href="/dashboard" className="login_back_home_btn" title="Back to dashboard">
            <Image
              src="/icons/back.svg"
              alt="Back to dashboard"
              width={24}
              height={24}
              unoptimized
              className="size-6 object-contain"
            />
          </Link>
        </div>

        <div className="login_form_area">
          <AuthBrand />
          {children}
        </div>

        <div />
      </div>

      <div className="login_slideshow_side">
        <div className="relative flex h-full min-h-[500px] w-full items-center justify-center">
          <Image
            src="/images/slideshowloginscreen.svg"
            alt=""
            fill
            unoptimized
            priority
            className="object-cover object-center"
          />
        </div>
      </div>
    </div>
  );
}

/** The 590St CAFE wordmark with the floating hearts from the storefront. */
export function AuthBrand() {
  return (
    <div className="login_logo-container">
      <div className="pointer-events-none absolute -inset-6" aria-hidden>
        <Heart className="absolute top-0 left-2 size-4 rotate-[-15deg] fill-pink-500 text-pink-500 animate-pulse" />
        <Heart className="absolute top-2 right-1 size-3.5 rotate-[20deg] fill-red-500 text-red-500" />
        <Heart className="absolute top-8 -left-4 size-4 rotate-[-30deg] fill-red-600 text-red-600" />
        <Heart className="absolute top-10 -right-5 size-3 rotate-[15deg] fill-pink-500 text-pink-500" />
        <Heart className="absolute bottom-2 left-0 size-3 rotate-[-10deg] fill-pink-600 text-pink-600" />
        <Heart className="absolute right-2 bottom-1 size-4 rotate-[25deg] fill-red-500 text-red-500" />
        <Heart className="absolute -top-3 left-1/2 size-3 -translate-x-1/2 fill-pink-400 text-pink-400" />
      </div>

      <div className="login_brand_title">
        590<span>St</span>
      </div>
      <div className="login_brand_subtitle">CAFE</div>
    </div>
  );
}
