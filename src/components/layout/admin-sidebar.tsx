"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { navigationSections } from "@/config/navigation";
import { useEffect, useState } from "react";
import SidebarProfile from "./mobile-sidebar";
import { useI18n } from "@/providers/i18n-provider";
import { useSidebarCollapse } from "@/providers/sidebar-collapse-provider";
import { Menu, X } from "lucide-react";

function isNavItemActive(pathname: string, href: string) {
  return pathname === href;
}

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isCollapsed } = useSidebarCollapse();
  const { t } = useI18n();

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Stop the page behind the drawer from scrolling while it is open.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobileMenuOpen]);

  const logo = (
    <Link href="/" onClick={handleNavClick} className="logo_link">
      <Image src="/logos/logoWhite.svg" alt="590st CAFE Logo" width={72} height={34} priority/>
    </Link>
  );

  const navItems = (
    <nav className="sidebar scrollbar">
      {navigationSections.map((section) => (
        <div key={section.title || "home"} className="sidebar_section" data-divider={section.dividerBefore}>
          {section.title && ( <p className="title"> {section.title} </p> )}
          <div className="sidebar_wrap">
            {section.items.map((item) => {
              const isActive = isNavItemActive(pathname, item.href);
              return (
                <Link key={item.name} href={item.href} onClick={handleNavClick} className={cn("sidebar_item", isActive ? "active" : "")}>
                  <item.icon className="icons" strokeWidth={2.2} />
                  <span className="sidebar_item_label">{t(item.label) || item.name}</span>
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
      <div className="mobile_header">
        <div className="mobile_header_inner">
          {logo}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="mobile_menu_trigger" aria-label="Toggle menu">
            {isMobileMenuOpen ? (
              <X className="mobile_trigger_icon" />
            ) : (
              <Menu className="mobile_trigger_icon" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && ( <div className="mobile_overlay" onClick={() => setIsMobileMenuOpen(false)}/>)}
      {/* Mobile Sidebar Drawer */}
      <div className={cn("mobile_drawer", isMobileMenuOpen && "is_open")}> 
        {navItems}
        <SidebarProfile isMobile={true} />
      </div>
      {/* Desktop Sidebar */}
      <div className={cn("desktop_sidebar", isCollapsed && "is_collapsed")}>
        <div className="logo_container">
          {logo}
        </div>
        {navItems}
        <SidebarProfile />
      </div>
    </>
  );
}
