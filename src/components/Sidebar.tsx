"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { navigationSections } from "@/constants/MenuConstant";
import { useState } from "react";
import SidebarProfile from "./SidebarProfile";
import { useI18n } from "@/contexts/I18nContext";
import { Menu, X } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useI18n();

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const logo = (
    <Link
      href="/"
      onClick={handleNavClick}
      className="flex h-12 items-center rounded-md bg-white px-4 hover:opacity-90"
    >
      <Image
        src="/Logo/Logo.svg"
        alt="590st CAFE Logo"
        width={72}
        height={34}
        className="h-9 w-auto"
        priority
      />
    </Link>
  );

  const navItems = (
    <nav className="flex-1 overflow-y-auto px-4 py-4">
      {navigationSections.map((section, sectionIndex) => (
        <div
          key={section.title || "home"}
          className={cn(
            sectionIndex > 0 && "pt-1",
            section.dividerBefore && "border-t border-white/75 pt-4"
          )}
        >
          {section.title && (
            <p className="mb-2 text-sm font-semibold text-white/75">
              {section.title}
            </p>
          )}
          <div className="mb-4 space-y-1">
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#befe35] text-black"
                      : "text-white hover:bg-white/10"
                  )}
                >
                  <item.icon className="h-5 w-5" strokeWidth={2.2} />
                  <span>{t(item.label) || item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-white/10 bg-black lg:hidden">
        <div className="flex items-center justify-between h-full px-4">
          {logo}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="cursor-pointer rounded-md p-2 text-white transition-colors hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 top-16 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={cn(
          "fixed left-0 top-16 z-50 flex h-[calc(100%-4rem)] w-64 transform flex-col bg-black transition-transform duration-300 ease-in-out lg:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {navItems}
        <SidebarProfile isMobile={true} />
      </div>

      {/* Desktop Sidebar */}
      <div className="fixed left-0 top-0 hidden h-full w-64 flex-col bg-black lg:flex">
        <div className="px-4 pb-3 pt-3">
          {logo}
        </div>
        {navItems}
        <SidebarProfile />
      </div>
    </>
  );
}
